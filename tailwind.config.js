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
					success: "#10B981",
					detailTitle: "#1F2937",
					fileTypeBadge: "#6D28D9",

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
					pptxBg: "#C2410C",
					defaultFileBg: "#6B7280",

					// Tag Colors
					pdfTagBg: "#F9B4B4",
					pdfTagText: "#A70707",

					docxTagBg: "#E4E3FE",
					docxTagText: "#2563EB",

					xlsxTagBg: "#B4EBC6",
					xlsxTagText: "#028A4F",

					pptxTagBg: "#E7B39E",
					pptxTagText: "#8E2E06",

					defaultTagBg: "#E5E7EB",

					// Page Header Colors
					headerBorder: "#EFEFEF",
					dark: "#000000",
					pageTitle: "#2E2E2E",

					// CTA Button
					downloadBtn: "#A020F0",
					downloadBtnHover: "#8B14D6",

					// Organization button
					orgBorder: "#C084FC",
					orgText: "#7C3AED",

					// Accordion
					accordionTitle: "#4338CA",

					// Ratings
					rating: "#FFD700",

					cardAccent: "#572E91",
					link: "#1D4ED8",

					backIcon: "#1E1E1E",
					sidebarIcon: "#555555",
					tabActiveBg: "#F1E9FF",
					pageBackground: "#F0F2F5",
					hadfieldBlue: "1177FF",
					"extremeBlack": "#101010",
					"softGray": "#DDDDDD",
					"lightGray": "#AAAAAA",
					"electricBlue": "#007BFF",
					"bluishPurple": "#4A3B94",
					"magnolia": "#F6F2FE",
					"darkCharcoal": "#333333",
					"neutralGray": "#DBDBDB",
					"mediumDarkGray": "#666666",
					"slateGray": "#64748b"
				},
			},
			fontFamily: {
				comfortaa: ["Comfortaa", "cursive"],
				sourceSans: ["Source Sans 3", "sans-serif"],
				inter: ["Inter", "sans-serif"],
				manrope: ["Manrope", "sans-serif"],
				montserrat: ["Montserrat", "sans-serif"],
			},
			backgroundImage: {
				heroGradient:
					"linear-gradient(180deg, #572F90 0%, #8C72B9 58%, #FFFFFF 100%)",
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
};
