"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchProjects, Project, normalizeImageUrl } from "@/lib/api";

interface FeaturedProjectsProps {
	initialProjects?: Project[];
}

const FeaturedProjects = ({ initialProjects = [] }: FeaturedProjectsProps) => {
	const [projects, setProjects] = useState<Project[]>(initialProjects);
	const [activeIndex, setActiveIndex] = useState(0);
	const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		if (initialProjects.length === 0) {
			const fetchFeaturedProjects = async () => {
				try {
					const data = await fetchProjects();
					setProjects(data);
				} catch (err) {
					console.error("Veri alınamadı", err);
					setProjects([]);
				}
			};
			fetchFeaturedProjects();
		}
	}, [initialProjects.length]);

	// IntersectionObserver to track which project is currently in view
	useEffect(() => {
		// Different settings for mobile vs desktop
		const isMobileView = typeof window !== 'undefined' && window.innerWidth < 1024;
		
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const index = Number(entry.target.getAttribute("data-index"));
						if (!Number.isNaN(index)) {
							setActiveIndex(index);
						}
					}
				});
			},
			{
				root: null,
				threshold: isMobileView ? 0.8 : 0.3,
				rootMargin: isMobileView ? "-50% 0px -30% 0px" : "-20% 0px -60% 0px",
			}
		);

		itemRefs.current.forEach((el) => {
			if (el) observer.observe(el);
		});

		return () => {
			itemRefs.current.forEach((el) => {
				if (el) observer.unobserve(el);
			});
		};
	}, [projects.length]);

	const activeProject = useMemo(() => {
		if (projects.length === 0) return null;
		return projects[activeIndex] ?? projects[0];
	}, [activeIndex, projects]);

	if (projects.length === 0 || !activeProject) return null;

	// Pre-process all media URLs and types
	const projectMedia = useMemo(() => {
		return projects.map((project) => {
			const mediaUrl = normalizeImageUrl(project.banner_media || "");
			const isVideo =
				mediaUrl.toLowerCase().endsWith(".mp4") ||
				mediaUrl.toLowerCase().endsWith(".webm") ||
				mediaUrl.toLowerCase().endsWith(".mov");
			return {
				url: mediaUrl,
				isVideo,
				title: project.title,
			};
		});
	}, [projects]);

	// Preload all images when component mounts and preload next image when activeIndex changes
	useEffect(() => {
		if (typeof window === 'undefined') return;
		
		const links: HTMLLinkElement[] = [];
		
		// Preload all images
		projectMedia.forEach((media) => {
			if (!media.isVideo && media.url) {
				const link = document.createElement('link');
				link.rel = 'preload';
				link.as = 'image';
				link.href = media.url;
				link.fetchPriority = 'high';
				document.head.appendChild(link);
				links.push(link);
			}
		});

		// Preload next image proactively
		const nextIndex = activeIndex + 1;
		if (nextIndex < projectMedia.length && !projectMedia[nextIndex].isVideo && projectMedia[nextIndex].url) {
			const nextLink = document.createElement('link');
			nextLink.rel = 'preload';
			nextLink.as = 'image';
			nextLink.href = projectMedia[nextIndex].url;
			nextLink.fetchPriority = 'high';
			document.head.appendChild(nextLink);
			links.push(nextLink);
		}

		return () => {
			links.forEach((link) => {
				if (document.head.contains(link)) {
					document.head.removeChild(link);
				}
			});
		};
	}, [projectMedia, activeIndex]);

	// Section and text container refs for height calculation (mobile only)
	const sectionRef = useRef<HTMLElement>(null);
	const textContainerRef = useRef<HTMLDivElement>(null);
	const [sectionHeight, setSectionHeight] = useState(0);
	const [isMobile, setIsMobile] = useState(false);

	// Check if mobile (client-side only)
	useEffect(() => {
		const checkMobile = () => {
			if (typeof window !== 'undefined') {
				setIsMobile(window.innerWidth < 1024);
			}
		};

		checkMobile();
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', checkMobile);
		}

		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('resize', checkMobile);
			}
		};
	}, []);

	// Calculate section height for mobile sticky behavior
	useEffect(() => {
		if (!isMobile || typeof window === 'undefined') {
			setSectionHeight(0);
			return;
		}

		const updateHeight = () => {
			if (sectionRef.current && isMobile) {
				// Measure the entire section height
				const height = sectionRef.current.offsetHeight;
				setSectionHeight(height);
			}
		};

		// Initial calculation with delay to ensure DOM is ready
		const timeoutId = setTimeout(updateHeight, 200);
		updateHeight();

		if (typeof window !== 'undefined') {
			window.addEventListener('resize', updateHeight);
		}

		// Use ResizeObserver for accurate height tracking
		let resizeObserver: ResizeObserver | null = null;
		if (sectionRef.current && typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => {
				if (isMobile) {
					updateHeight();
				}
			});
			resizeObserver.observe(sectionRef.current);
		}

		return () => {
			clearTimeout(timeoutId);
			if (typeof window !== 'undefined') {
				window.removeEventListener('resize', updateHeight);
			}
			if (resizeObserver && sectionRef.current) {
				resizeObserver.unobserve(sectionRef.current);
			}
		};
	}, [projects.length, isMobile]);

	return (
		<section ref={sectionRef} id="featured-projects" className="p-4 mb-20 md:mb-1">
			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
				{/* Text Column - Mobile: Second, Desktop: First */}
				<div 
					ref={textContainerRef}
					className="relative order-2 lg:order-1 pb-10 pt-80 md:py-90 z-0"
				>
					<div className="flex flex-col space-y-[150px]">
						{projects.map((project, index) => (
							<div
								key={project.id ?? `${project.slug}-${index}`}
								ref={(el) => {
									itemRefs.current[index] = el;
								}}
								data-index={index}
								className="group flex flex-col text-white transition-opacity duration-300"
							>
								<Link href={`/projects/${project.slug}`} className="inline-block max-w-xl">
									<span
										className={`text-4xl font-medium uppercase leading-[0.9] transition-[opacity,transform] duration-500 ease-out md:text-5xl ${
											activeIndex === index ? "opacity-100" : "opacity-40"
										}`}
									>
										{project.title}
									</span>
								</Link>
								{project.subtitle && (
									<p className="max-w-md text-sm font-medium uppercase tracking-[0.2em] text-white/50">
										{project.subtitle}
									</p>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Image Column - Mobile: First, Desktop: Second */}
				<div className="relative order-1 lg:order-2">
					{/* Mobile: Absolute wrapper with section height */}
					{/* Desktop: Simple sticky wrapper */}
					{isMobile ? (
						<div 
							className="absolute top-0 z-10"
							style={{ 
								display: 'flex',
								alignItems: 'flex-start',
								justifyContent: 'center',
								flexDirection: 'row',
								flexWrap: 'nowrap',
								gap: '10px',
								width: '100%',
								height: sectionHeight > 0 ? `${sectionHeight}px` : 'auto',
								flex: '1 0 0px',
								overflow: 'visible',
								padding: 0,
								position: 'absolute',
								top: 0,
								right: 0,
							}}
						>
							{/* Absolute positioned image container */}
							<div 
								className="absolute top-0 right-0 w-full flex items-center justify-center"
								style={{ 
									position: 'sticky',
									top: "85px",
									right: 0,
									width: '100%',
									height: "auto",
									pointerEvents: 'none',
									flex: 'none',
									alignSelf: 'unset',
								}}
							>
								<div className="relative w-full h-full overflow-hidden rounded-[10px] bg-black/20">
									{projectMedia[activeIndex] && (
										<>
											{projectMedia[activeIndex].isVideo ? (
												<video
													key={`mobile-video-${activeIndex}`}
													src={projectMedia[activeIndex].url}
													autoPlay
													muted
													loop
													playsInline
													className="h-full w-full object-cover"
												/>
											) : (
												<Image
													key={`mobile-image-${activeIndex}`}
													src={projectMedia[activeIndex].url}
													alt={projectMedia[activeIndex].title}
													width={1200}
													height={800}
													quality={95}
													sizes="(max-width: 768px) 100vw, 50vw"
													className="h-full w-full object-cover"
													priority={true}
													loading="eager"
												/>
											)}
										</>
									)}
								</div>
							</div>
						</div>
					) : (
						<div className="relative md:sticky top-0 flex md:h-screen w-full items-center justify-center">
							<div className="relative w-full overflow-hidden rounded-[10px] bg-black/20">
								{projectMedia[activeIndex] && (
									<>
										{projectMedia[activeIndex].isVideo ? (
											<video
												key={`desktop-video-${activeIndex}`}
												src={projectMedia[activeIndex].url}
												autoPlay
												muted
												loop
												playsInline
												className="h-full w-full object-cover"
											/>
										) : (
											<Image
												key={`desktop-image-${activeIndex}`}
												src={projectMedia[activeIndex].url}
												alt={projectMedia[activeIndex].title}
												width={1200}
												height={800}
												quality={95}
												sizes="(max-width: 768px) 100vw, 50vw"
												className="h-full w-full object-cover"
												priority={true}
												loading="eager"
											/>
										)}
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default FeaturedProjects;
