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
				threshold: 0.3,
				rootMargin: "-20% 0px -60% 0px",
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

	const activeMediaUrl = normalizeImageUrl(
		activeProject.banner_media || ""
	);
	const activeIsVideo =
		activeMediaUrl.toLowerCase().endsWith(".mp4") ||
		activeMediaUrl.toLowerCase().endsWith(".webm") ||
		activeMediaUrl.toLowerCase().endsWith(".mov");

	return (
		<section id="featured-projects" className="p-4">

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
				<div className="relative py-90">
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

				<div className="relative ">
					<div className="sticky top-0 flex h-screen w-full items-center justify-center">
						<div className="relative w-full overflow-hidden rounded-[10px] bg-black/20">
							{activeIsVideo ? (
								<video
									key={activeMediaUrl}
									src={activeMediaUrl}
									autoPlay
									muted
									loop
									playsInline
									className="h-full w-full object-cover"
								/>
							) : (
								<Image
									key={activeMediaUrl}
									src={activeMediaUrl}
									alt={activeProject.title}
									width={1200}
									height={800}
									className="h-full w-full object-cover"
									priority
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default FeaturedProjects;
