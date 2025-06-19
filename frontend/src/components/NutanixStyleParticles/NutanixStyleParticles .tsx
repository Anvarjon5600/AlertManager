import { useEffect, useRef } from "react";

export const NutanixStyleParticles = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Настройка canvas
		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;

			// Создание градиента (как в Nutanix Prism)
			const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			gradient.addColorStop(0, "#0A1A2F");  // Тёмно-синий (верх)
			gradient.addColorStop(1, "#1A2E4A");  // Сине-серый (низ)
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		};
		resizeCanvas();

		type Particle = {
			x: number;
			y: number;
			size: number;
			speedX: number;
			speedY: number;
			color: string;
		};

		const particles: Particle[] = [];
		const particleCount = 200; // Больше частиц
		const maxDistance = 100; // Расстояние для связей

		// Создание частиц
		for (let i = 0; i < particleCount; i++) {
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				size: 1, // Миниатюрные точки
				speedX: (Math.random() - 0.5) * 0.2, // Медленное движение
				speedY: (Math.random() - 0.5) * 0.2,
				color: i % 4 === 0
					? "rgba(100, 149, 237, 0.6)"  // Голубой
					: "rgba(255, 255, 255, 0.3)", // Полупрозрачный белый
			});
		}

		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = "#0f172a"; // Тёмный фон
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			particles.forEach((p) => {
				p.x += p.speedX;
				p.y += p.speedY;

				// Мягкое отражение от границ
				if (p.x < 0 || p.x > canvas.width) p.speedX *= -0.8;
				if (p.y < 0 || p.y > canvas.height) p.speedY *= -0.8;

				// Отрисовка точки
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fillStyle = p.color;
				ctx.fill();

				// Связи между точками
				particles.forEach((p2) => {
					const dx = p.x - p2.x;
					const dy = p.y - p2.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < maxDistance) {
						ctx.beginPath();
						ctx.strokeStyle = `rgba(100, 149, 237, ${0.2 - distance / maxDistance * 0.2})`;
						ctx.lineWidth = 0.3; // Тонкие линии
						ctx.moveTo(p.x, p.y);
						ctx.lineTo(p2.x, p2.y);
						ctx.stroke();
					}
				});
			});

			requestAnimationFrame(animate);
		};

		animate();
		window.addEventListener("resize", resizeCanvas);
		return () => window.removeEventListener("resize", resizeCanvas);
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: -1,
				pointerEvents: "none",
			}}
		/>
	);
};