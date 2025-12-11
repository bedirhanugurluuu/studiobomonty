"use client";

import { useRef, useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { Mesh, LinearFilter, Raycaster, Vector2 } from "three";
import { normalizeImageUrl, fetchGalleryItemsSSR, GalleryItem } from "@/lib/api";
import SEO from "@/components/SEO";
import { GetStaticProps } from "next";

interface GalleryProps {
  items?: GalleryItem[];
}

// 3D Image Component - Billboard effect (always faces camera)
function ImageSphere({ 
  position, 
  imageUrl, 
  item,
  onTextureLoaded
}: { 
  position: [number, number, number]; 
  imageUrl: string;
  item: GalleryItem;
  onTextureLoaded?: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(imageUrl);
  const [aspectRatio, setAspectRatio] = useState(1); // Default 1:1
  
  // Store item reference in mesh for raycasting
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.galleryItem = item;
    }
  }, [item]);
  
  // Optimize texture quality for performance (lower quality for better performance)
  useEffect(() => {
    if (texture) {
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;
      
      // Texture yüklendiğinde callback çağır ve aspect ratio'yu hesapla
      const image = texture.image as HTMLImageElement;
      if (image) {
        // Calculate aspect ratio from image dimensions
        const width = image.width || image.naturalWidth || 1;
        const height = image.height || image.naturalHeight || 1;
        const ratio = width / height;
        setAspectRatio(ratio);
        
        if (image.complete) {
          onTextureLoaded?.();
        } else {
          image.onload = () => {
            const imgWidth = image.width || image.naturalWidth || 1;
            const imgHeight = image.height || image.naturalHeight || 1;
            const imgRatio = imgWidth / imgHeight;
            setAspectRatio(imgRatio);
            onTextureLoaded?.();
          };
        }
      }
    }
  }, [texture, onTextureLoaded]);

  useFrame(({ camera }) => {
    if (meshRef.current) {
      // Billboard effect: Always face the camera
      meshRef.current.lookAt(camera.position);
    }
  });

  // Calculate plane dimensions based on aspect ratio
  // Base height is 3, width adjusts based on aspect ratio (increased from 2 for better visibility)
  const baseSize = 3.5;
  const planeWidth = baseSize * aspectRatio;
  const planeHeight = baseSize;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (document.body) {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        if (document.body) {
          document.body.style.cursor = "auto";
        }
      }}
    >
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

// Loading fallback
function LoadingSphere({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <planeGeometry args={[2, 2]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  );
}

// Main 3D Scene Component
function Scene({ 
  items, 
  onImageClick,
  onAllTexturesLoaded
}: { 
  items: GalleryItem[]; 
  onImageClick: (item: GalleryItem) => void;
  onAllTexturesLoaded?: () => void;
}) {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new Raycaster(), []);
  const mouse = useMemo(() => new Vector2(), []);
  const baseRadius = 8; // Temel daire yarıçapı
  const itemsPerCircle = items.length;
  const loadedTexturesRef = useRef(0);
  const totalTexturesRef = useRef(items.length);
  const [scrollRadius, setScrollRadius] = useState(baseRadius);
  const scrollYRef = useRef(0);
  
  // Handle click with raycasting to find the closest/frontmost image
  const handleCanvasClick = useCallback((event: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Get all meshes with galleryItem userData
    const meshes: Mesh[] = [];
    scene.traverse((object) => {
      if (object instanceof Mesh && object.userData.galleryItem) {
        meshes.push(object);
      }
    });
    
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
      // Get the closest intersection (first one is closest/frontmost)
      const clickedMesh = intersects[0].object as Mesh;
      const item = clickedMesh.userData.galleryItem as GalleryItem;
      if (item) {
        onImageClick(item);
      }
    }
  }, [camera, gl, mouse, raycaster, scene, onImageClick]);
  
  // Add click event listener
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', handleCanvasClick);
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [gl.domElement, handleCanvasClick]);

  // Scroll event handler - aşağı scroll = uzaklaş ve x eksenine doğru uzasın
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Scroll pozisyonuna göre radius'u hesapla - daha hızlı ve az scroll'da açılsın
      // Scroll 0 ise baseRadius, scroll arttıkça radius artar
      const maxScroll = 800; // Maksimum scroll değeri azaltıldı (daha az scroll)
      const scrollRatio = Math.min(currentScrollY / maxScroll, 1);
      const newRadius = baseRadius + (scrollRatio * 12); // 8'den 20'ye kadar - hızlı açılma
      
      setScrollRadius(newRadius);
      scrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [baseRadius]);

  // Görsellerin açılarını sabit tut (sadece radius değişecek) - uniform küresel dağılım
  const angles = useMemo(() => {
    const minDistance = 0.5; // Minimum açısal mesafe (radyan cinsinden) - daha az sıkı
    const generatedAngles: { theta: number; phi: number }[] = [];
    
    // Fisher-Yates shuffle ile görselleri karıştır
    const shuffledIndices = Array.from({ length: items.length }, (_, i) => i);
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }
    
    for (let i = 0; i < items.length; i++) {
      let attempts = 0;
      let validPosition = false;
      let theta: number, phi: number;
      
      // Minimum mesafe kontrolü ile pozisyon bul
      while (!validPosition && attempts < 200) {
        // Tamamen random küresel koordinatlar
        theta = Math.random() * Math.PI * 2; // 0-2π arası random
        phi = Math.acos(2 * Math.random() - 1); // Uniform küresel dağılım
        
        // Diğer görsellerle mesafe kontrolü (3D uzaklık)
        validPosition = generatedAngles.every((existing) => {
          // Küresel koordinatlardan 3D mesafe hesapla
          const x1 = Math.sin(phi) * Math.cos(theta);
          const y1 = Math.cos(phi);
          const z1 = Math.sin(phi) * Math.sin(theta);
          
          const x2 = Math.sin(existing.phi) * Math.cos(existing.theta);
          const y2 = Math.cos(existing.phi);
          const z2 = Math.sin(existing.phi) * Math.sin(existing.theta);
          
          const distance = Math.sqrt(
            Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2)
          );
          
          return distance >= minDistance;
        });
        
        attempts++;
      }
      
      // Eğer geçerli pozisyon bulunamazsa, tamamen random bir pozisyon kullan
      if (!validPosition) {
        // Tamamen random küresel koordinatlar
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos(2 * Math.random() - 1);
      }
      
      generatedAngles.push({ theta: theta!, phi: phi! });
    }
    
    return generatedAngles;
  }, [items.length, itemsPerCircle]);

  // Scroll'a göre pozisyonları hesapla - x eksenine doğru uzasın
  const positions = useMemo(() => {
    // Scroll ratio'yu radius'tan hesapla (baseRadius=8, max=20, scrollRatio = (scrollRadius-8)/12)
    const scrollRatio = Math.max(0, Math.min(1, (scrollRadius - baseRadius) / 12));
    
    // X eksenini daha fazla uzat (elipsoid efekti)
    const xScale = 1 + (scrollRatio * 1.5); // 1'den 2.5'e kadar
    
    return angles.map(({ theta, phi }) => {
      const x = scrollRadius * Math.sin(phi) * Math.cos(theta) * xScale;
      const y = scrollRadius * Math.cos(phi);
      const z = scrollRadius * Math.sin(phi) * Math.sin(theta);
      return [x, y, z] as [number, number, number];
    });
  }, [angles, scrollRadius, baseRadius]);

  const handleTextureLoaded = useCallback(() => {
    loadedTexturesRef.current += 1;
    if (loadedTexturesRef.current >= totalTexturesRef.current) {
      onAllTexturesLoaded?.();
    }
  }, [onAllTexturesLoaded]);

  // Reset counter when items change
  useEffect(() => {
    loadedTexturesRef.current = 0;
    totalTexturesRef.current = items.length;
  }, [items.length]);

  return (
    <>
      <ambientLight intensity={2} />
      <pointLight position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {items.map((item, index) => (
        <Suspense key={item.id} fallback={<LoadingSphere position={positions[index]} />}>
          <ImageSphere
            position={positions[index]}
            imageUrl={normalizeImageUrl(item.image)}
            item={item}
            onTextureLoaded={handleTextureLoaded}
          />
        </Suspense>
      ))}
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={0.3}
      />
    </>
  );
}

// Loading Component
function GalleryLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className="preloader-1">
        <div>Loading</div>
        <span className="line line-1"></span>
        <span className="line line-2"></span>
        <span className="line line-3"></span>
        <span className="line line-4"></span>
        <span className="line line-5"></span>
        <span className="line line-6"></span>
        <span className="line line-7"></span>
        <span className="line line-8"></span>
        <span className="line line-9"></span>
      </div>

      <div className="preloader-2">
        <span className="line line-1"></span>
        <span className="line line-2"></span>
        <span className="line line-3"></span>
        <span className="line line-4"></span>
        <span className="line line-5"></span>
        <span className="line line-6"></span>
        <span className="line line-7"></span>
        <span className="line line-8"></span>
        <span className="line line-9"></span>
        <div>Loading</div>
      </div>

      <style jsx>{`
        .preloader-1 {
          margin: 100px auto 0;
          width: 66px;
          height: 12px;
        }

        .preloader-2 {
          margin: 120px auto 0;
        }

        div {
          color: #fff;
          margin: 5px 0;
          text-transform: uppercase;
          text-align: center;
          font-family: 'Arial', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .preloader-1 .line {
          width: 1px;
          height: 12px;
          background: #fff;
          margin: 0 1px;
          display: inline-block;
          animation: opacity-1 1000ms infinite ease-in-out;
        }

        .preloader-2 .line {
          width: 1px;
          height: 12px;
          background: #fff;
          margin: 0 1px;
          display: inline-block;
          animation: opacity-2 1000ms infinite ease-in-out;
        }

        .preloader-1 .line-1, .preloader-2 .line-1 { animation-delay: 800ms; }
        .preloader-1 .line-2, .preloader-2 .line-2 { animation-delay: 600ms; }
        .preloader-1 .line-3, .preloader-2 .line-3 { animation-delay: 400ms; }
        .preloader-1 .line-4, .preloader-2 .line-4 { animation-delay: 200ms; }
        .preloader-1 .line-6, .preloader-2 .line-6 { animation-delay: 200ms; }
        .preloader-1 .line-7, .preloader-2 .line-7 { animation-delay: 400ms; }
        .preloader-1 .line-8, .preloader-2 .line-8 { animation-delay: 600ms; }
        .preloader-1 .line-9, .preloader-2 .line-9 { animation-delay: 800ms; }

        @keyframes opacity-1 { 
          0% { 
            opacity: 1;
          }
          50% { 
            opacity: 0;
          }
          100% { 
            opacity: 1;
          }  
        }

        @keyframes opacity-2 { 
          0% { 
            opacity: 1;
            height: 15px;
          }
          50% { 
            opacity: 0;
            height: 12px;
          }
          100% { 
            opacity: 1;
            height: 15px;
          }  
        }
      `}</style>
    </div>
  );
}

// Popup Modal Component
function ImageModal({ 
  item, 
  isOpen, 
  onClose 
}: { 
  item: GalleryItem | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl mx-4 bg-black border border-white/20 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 cursor-pointer p-2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col">
          {/* Üst: Görsel - Daha büyük */}
          <div className="w-full relative flex-shrink-0">
            <img
              src={normalizeImageUrl(item.image)}
              alt={item.title}
              className="w-full h-auto max-h-[60vh] object-contain"
            />
          </div>

          {/* Alt: Yazılar */}
          <div className="p-6 md:p-8 flex flex-col text-white flex-shrink-0">
            <h2 className="text-2xl md:text-3xl font-medium uppercase mb-3">
              {item.title}
            </h2>
            {item.description && (
              <p className="text-base md:text-lg text-white/60 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage({ items: initialItems = [] }: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use items from props (fetched via getStaticProps)
  useEffect(() => {
    if (initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  // Tüm texture'lar yüklendiğinde çağrılır
  const handleAllTexturesLoaded = useCallback(() => {
    // Texture'lar yüklendi, loading'i kapat
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  const handleImageClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  return (
    <>
      <SEO
        title="Gallery Studio - StudioBomonty"
        description="Explore our creative work in an immersive 3D gallery experience"
        image="https://studiobomonty.vercel.app/images/og-image.jpg"
      />
      <div className="bg-black" style={{ minHeight: '150vh' }}>
        {isLoading && <GalleryLoader />}
        <div className={`fixed inset-0 w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center text-white">
              <p>Loading gallery...</p>
            </div>
          }>
            <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
              <Scene 
                items={items} 
                onImageClick={handleImageClick}
                onAllTexturesLoaded={handleAllTexturesLoaded}
              />
            </Canvas>
          </Suspense>
        </div>

        <ImageModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const items = await fetchGalleryItemsSSR();
    
    return {
      props: {
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          image: normalizeImageUrl(item.image),
          description: item.description || ''
        }))
      },
      revalidate: 60 // 1 dakikada bir yenile
    };
  } catch (error) {
    console.error('Gallery static props error:', error);
    return {
      props: {
        items: []
      },
      revalidate: 60
    };
  }
};
