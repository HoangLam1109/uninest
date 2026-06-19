/** Static assets in /public; room cards may use Figma MCP URLs (~7 days). */
export const images = {
  hero: '/hero.jpg',
  authPanel: '/auth-panel.jpg',
  logo: '/logo.png',
  rooms: [
    'https://www.figma.com/api/mcp/asset/c7815ab5-3e35-46b8-a8a4-832b17c27d81',
    'https://www.figma.com/api/mcp/asset/e69c0b47-1206-4bfc-ad89-83776b8d9d2d',
    'https://www.figma.com/api/mcp/asset/8dc1a886-97ae-4e34-bace-9a6cb58a2763',
    'https://www.figma.com/api/mcp/asset/e0a01af1-50f3-4a07-8ffd-3ecabebf208d',
  ],
  landlord: '/landlord-working.png',
} as const
