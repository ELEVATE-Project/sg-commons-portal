/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				repository: {
					// Layout / structure
					heading: "#27272A",
					border: "#EEECE6",
					borderHover: "#E0DDD4",
					divider: "#E5E7EB",

					// Typography
					title: "#111110",
					subtitle: "#9E9D97",
					body: "#4B5563",
					textPrimary: "#374151",
					textSecondary: "#6B7280",
					strongText: "#111827",

					// Brand / action
					primary: "#5832AC",
					secondary: "#6B7280",

  					// Icons / UI elements
					iconBg: "#E4E3FF",
					iconColor: "#6B6A65",
					controlBorder: "#D1D5DB",
					controlIcon: "#9CA3AF",

					// Surfaces
					surface: "#F9FAFB",
					surfaceSoft: "#F3F4F6",

					// Resource Card
					cardBorder: "#E7E5E4",
					cardTitle: "#2F2F2F",
					cardDescription: "#71717A",
					cardMeta: "#8A8A8A",

					// File Type Colors
					pdfBg: "#F70C36",
					docxBg: "#2563EB",
					xlsxBg: "#0DB563",
					defaultFileBg: "#6B7280",

					// Tag Colors
					pdfTagBg: "#F9B4B4",
					pdfTagText: "#A70707",

					docxTagBg: "#E4E3FE",
					docxTagText: "#2563EB",

					xlsxTagBg: "#B4EBC6",
					xlsxTagText: "#028A4F",

					defaultTagBg: "#E5E7EB",

					// Page Header Colors
  					headerBorder: "#EFEFEF",
  					dark: "#000000",
  					pageTitle: "#2E2E2E",
				},
			},
			fontFamily: {
				comfortaa: ["Comfortaa", "cursive"],
				sourceSans: ["Source Sans 3", "sans-serif"],
				inter: ["Inter", "sans-serif"],
				manrope: ["Manrope", "sans-serif"],
				montserrat: ["Montserrat", "sans-serif"],
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
};
