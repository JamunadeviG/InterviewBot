import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motion, useScroll, useTransform } from "framer-motion";
import { Brain, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function HomePage() {
    const mountRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: scrollContainerRef,
        offset: ["start start", "end end"],
    });

    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const opacityFeatures = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
    const yFeatures = useTransform(scrollYProgress, [0.4, 0.6], [100, 0]);

    useEffect(() => {
        if (!mountRef.current) return;

        const CONFIG = {
            particleCount: 3600,
            particleSize: 0.12,
            particleColor: 0x6600ff,
            bgColor: 0x0f172a,
            sphereRadius: 6,
            gridRow: 60,
            gridCol: 60,
            gridSpacing: 1.2,
            waveFrequency: 0.3,
            waveSpeed: 1.5,
        };

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.bgColor);
        scene.fog = new THREE.FogExp2(CONFIG.bgColor, 0.02);

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 15);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const container = mountRef.current;
        container.appendChild(renderer.domElement);

        // -------- WAVE GRID --------
        const wavePositions = new Float32Array(CONFIG.particleCount * 3);

        for (let x = 0; x < CONFIG.gridRow; x++) {
            for (let z = 0; z < CONFIG.gridCol; z++) {
                const i = (x * CONFIG.gridCol + z) * 3;
                wavePositions[i] = (x - CONFIG.gridRow / 2) * CONFIG.gridSpacing;
                wavePositions[i + 1] = 0;
                wavePositions[i + 2] = (z - CONFIG.gridCol / 2) * CONFIG.gridSpacing;
            }
        }

        // -------- SPHERE --------
        const spherePositions = new Float32Array(CONFIG.particleCount * 3);
        const phi = Math.PI * (3 - Math.sqrt(5));

        for (let k = 0; k < CONFIG.particleCount; k++) {
            const y = 1 - (k / (CONFIG.particleCount - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * k;

            const k3 = k * 3;
            spherePositions[k3] = Math.cos(theta) * radius * CONFIG.sphereRadius;
            spherePositions[k3 + 1] = y * CONFIG.sphereRadius;
            spherePositions[k3 + 2] = Math.sin(theta) * radius * CONFIG.sphereRadius;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(wavePositions.slice(), 3)
        );

        const material = new THREE.PointsMaterial({
            color: CONFIG.particleColor,
            size: CONFIG.particleSize,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        const clock = new THREE.Clock();
        let activeScrollProp = 0;
        let animationId: number;

        const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

        const baseColor = new THREE.Color(0x6600ff);
        const targetColor = new THREE.Color(0x00d4ff);

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            const pos = geometry.attributes.position.array as Float32Array;

            for (let k = 0; k < CONFIG.particleCount; k++) {
                const k3 = k * 3;

                const wx = wavePositions[k3];
                const wz = wavePositions[k3 + 2];
                const wy =
                    Math.sin(wx * CONFIG.waveFrequency + time * CONFIG.waveSpeed) *
                    Math.cos(wz * CONFIG.waveFrequency + time * CONFIG.waveSpeed) *
                    2;

                const sx = spherePositions[k3];
                const sy = spherePositions[k3 + 1];
                const sz = spherePositions[k3 + 2];

                const t = activeScrollProp;
                pos[k3] = lerp(wx, sx, t);
                pos[k3 + 1] = lerp(wy, sy, t);
                pos[k3 + 2] = lerp(wz, sz, t);
            }

            geometry.attributes.position.needsUpdate = true;

            particles.rotation.y = time * 0.1;
            camera.position.z = lerp(15, 12, activeScrollProp);
            material.color.lerpColors(baseColor, targetColor, activeScrollProp);

            renderer.render(scene, camera);
        };

        animate();

        const unsub = scrollYProgress.on("change", (latest) => {
            if (latest < 0.1) activeScrollProp = 0;
            else if (latest > 0.5) activeScrollProp = 1;
            else activeScrollProp = (latest - 0.1) / 0.4;
        });

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            unsub();
            window.removeEventListener("resize", handleResize);
            container.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    return (
        <PageWrapper>
            <div ref={scrollContainerRef} className="relative w-full bg-slate-900">
                {/* Canvas */}
                <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />

                {/* HERO */}
                <motion.section
                    style={{ opacity: opacityHero }}
                    className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-4"
                >
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
                            Interview Bot
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 mb-10">
                            The evolution of technical interview preparation.
                        </p>

                        <div className="flex flex-col md:flex-row gap-6 justify-center">
                            <Link
                                to="/interview"
                                className="px-8 py-4 rounded-full text-lg font-semibold text-white border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-105 transition"
                            >
                                Start Practice
                            </Link>

                            <Link
                                to={user ? `/roadmap/${user.id}` : "/login"}
                                className="px-8 py-4 rounded-full text-lg font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
                            >
                                View Roadmap
                            </Link>
                        </div>
                    </div>
                </motion.section>

                {/* FEATURES */}
                <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
                    <motion.div
                        style={{ opacity: opacityFeatures, y: yFeatures }}
                        className="max-w-6xl mx-auto w-full"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Brain,
                                    title: "AI Neural Core",
                                    desc: "Trained on thousands of real interview scenarios.",
                                    color: "indigo",
                                },
                                {
                                    icon: Target,
                                    title: "Precision Feedback",
                                    desc: "Instant analysis on code & communication.",
                                    color: "cyan",
                                },
                                {
                                    icon: Zap,
                                    title: "Real-time Evolution",
                                    desc: "Difficulty adapts to your performance.",
                                    color: "purple",
                                },
                            ].map((f, i) => (
                                <div
                                    key={i}
                                    className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-indigo-500/50 hover:-translate-y-2 transition"
                                >
                                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-6 text-indigo-400">
                                        <f.icon size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">
                                        {f.title}
                                    </h3>
                                    <p className="text-slate-400">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                <div className="h-[20vh]" />
            </div>
        </PageWrapper>
    );
}
