export default {
  base: '/folding-laundry/',
  build: {
    rollupOptions: {
      external: ['three']
    }
  },
  define: {
    'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production')
  }
}