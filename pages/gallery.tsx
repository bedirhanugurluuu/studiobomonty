"use client";

import { useRef, useState, useEffect, Suspense, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { Mesh, LinearFilter } from "three";
import { normalizeImageUrl } from "@/lib/api";
import SEO from "@/components/SEO";

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description?: string;
}

interface GalleryProps {
  items?: GalleryItem[];
}

// 3D Image Component - Billboard effect (always faces camera)
function ImageSphere({ 
  position, 
  imageUrl, 
  onClick,
  onTextureLoaded
}: { 
  position: [number, number, number]; 
  imageUrl: string;
  onClick: () => void;
  onTextureLoaded?: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(imageUrl);
  
  // Optimize texture quality for performance (lower quality for better performance)
  useEffect(() => {
    if (texture) {
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.generateMipmaps = false;
      
      // Texture yüklendiğinde callback çağır
      const image = texture.image as HTMLImageElement;
      if (image) {
        if (image.complete) {
          onTextureLoaded?.();
        } else {
          image.onload = () => {
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

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
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
      <planeGeometry args={[2, 2]} />
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
  const radius = 8; // Daire yarıçapı
  const itemsPerCircle = items.length;
  const loadedTexturesRef = useRef(0);
  const totalTexturesRef = useRef(items.length);

  // Görselleri küre yüzeyinde (spherical coordinates) random yerleştir
  const positions = useMemo(() => {
    return items.map((_, index) => {
      // Spherical coordinates: theta (azimuth) ve phi (polar)
      // Theta: 0 to 2π (tam daire - sağa sola)
      // Phi: 0 to π (yukarı aşağı - üstten alta)
      const theta = (index / itemsPerCircle) * Math.PI * 2; // Azimuth angle
      const phi = Math.acos(2 * Math.random() - 1); // Polar angle (uniform distribution on sphere)
      
      // Spherical to Cartesian conversion
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      return [x, y, z] as [number, number, number];
    });
  }, [items.length, itemsPerCircle, radius]);

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
            onClick={() => onImageClick(item)}
            onTextureLoaded={handleTextureLoaded}
          />
        </Suspense>
      ))}
      
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        autoRotate={false}
        autoRotateSpeed={0.5}
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
  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl mx-4 bg-black border border-white/20 rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
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

        <div className="grid md:grid-cols-2 gap-0">
          {/* Sol: Görsel */}
          <div className="relative aspect-square md:aspect-auto md:h-[600px]">
            <img
              src={normalizeImageUrl(item.image)}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Sağ: Yazılar */}
          <div className="p-8 md:p-12 flex flex-col justify-center text-white">
            <h2 className="text-3xl md:text-4xl font-medium uppercase mb-4">
              {item.title}
            </h2>
            {item.subtitle && (
              <p className="text-lg md:text-xl text-white/70 mb-6 uppercase tracking-wider">
                {item.subtitle}
              </p>
            )}
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

  // Static images from internet
  useEffect(() => {
    if (items.length === 0) {
      const staticImages: GalleryItem[] = [
        {
          id: "1",
          title: "Creative Design",
          subtitle: "Brand Identity",
          image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=300&fit=crop&q=60",
          description: "A modern approach to brand identity design that captures the essence of contemporary aesthetics."
        },
        {
          id: "2",
          title: "Digital Experience",
          subtitle: "User Interface",
          image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=300&h=300&fit=crop&q=60",
          description: "Creating intuitive and beautiful user interfaces that enhance digital experiences."
        },
        {
          id: "3",
          title: "Visual Storytelling",
          subtitle: "Photography",
          image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop&q=60",
          description: "Capturing moments and stories through the lens of creative photography."
        },
        {
          id: "4",
          title: "Motion Graphics",
          subtitle: "Animation",
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop&q=60",
          description: "Bringing static designs to life with smooth and engaging animations."
        },
        {
          id: "5",
          title: "Architectural Vision",
          subtitle: "3D Rendering",
          image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=300&h=300&fit=crop&q=60",
          description: "Visualizing architectural concepts through detailed 3D renderings."
        },
        {
          id: "6",
          title: "Product Design",
          subtitle: "Industrial",
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&q=60",
          description: "Designing products that combine functionality with aesthetic appeal."
        },
        {
          id: "7",
          title: "Fashion Editorial",
          subtitle: "Styling",
          image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop&q=60",
          description: "Curating fashion stories that express unique style and vision."
        },
        {
          id: "8",
          title: "Art Direction",
          subtitle: "Creative",
          image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=300&h=300&fit=crop&q=60",
          description: "Directing creative projects with a focus on visual storytelling."
        },
        {
          id: "9",
          title: "Web Design",
          subtitle: "Digital",
          image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&h=300&fit=crop&q=60",
          description: "Crafting responsive and engaging web experiences."
        },
        {
          id: "10",
          title: "Brand Campaign",
          subtitle: "Marketing",
          image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=300&h=300&fit=crop&q=60",
          description: "Developing comprehensive brand campaigns that resonate with audiences."
        },
        {
          id: "11",
          title: "Editorial Design",
          subtitle: "Print",
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop&q=60",
          description: "Designing print materials that communicate effectively and beautifully."
        },
        {
          id: "12",
          title: "Packaging Design",
          subtitle: "Product",
          image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=300&h=300&fit=crop&q=60",
          description: "Creating packaging that stands out on shelves and tells a brand story."
        },
        {
          id: "13",
          title: "Event Design",
          subtitle: "Experience",
          image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&h=300&fit=crop&q=60",
          description: "Designing memorable event experiences that leave lasting impressions."
        },
        {
          id: "14",
          title: "Typography",
          subtitle: "Lettering",
          image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop&q=60",
          description: "Exploring the art of typography and custom lettering."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "16",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "17",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
        {
          id: "15",
          title: "Concept Art",
          subtitle: "Illustration",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&q=60",
          description: "Creating conceptual illustrations that bring ideas to visual life."
        },
      ];
      setItems(staticImages);
    }
  }, [items.length]);

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
      <div className="min-h-screen bg-black">
        {isLoading && <GalleryLoader />}
        <div className={`h-screen w-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
          <Suspense fallback={
            <div className="h-full w-full flex items-center justify-center text-white">
              <p>Loading gallery...</p>
            </div>
          }>
            <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
              <Scene 
                items={items} 
                onImageClick={handleImageClick}
                onAllTexturesLoaded={handleAllTexturesLoaded}
              />
            </Canvas>
          </Suspense>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm text-center z-10">
          <p>Drag to rotate • Click on images to view details</p>
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
