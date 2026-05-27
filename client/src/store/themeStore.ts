import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'



interface ThemeStore {
	isDarkMode: boolean;
	toggleTheme: () => void;
}



export const useThemeStore = create<ThemeStore>()(
	devtools(
		persist(
			(set) => (
				{
					isDarkMode: true,
					toggleTheme: () => set(
						(state) => ({
							isDarkMode: !state.isDarkMode,
						}),
						false,
						'toggleTheme'
					),
				}
			),
			{
				name: 'theme'
			},
		),
		{
			name: 'ThemeStore'
		}
	)
);