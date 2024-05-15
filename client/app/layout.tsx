import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FavoritesSidebar from '@/components/FavoritesSidebar'
import './globals.css'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700']
 })

export const metadata: Metadata = {
  title: 'FlashPrix',
  description: 'Track product prices effortlessly and save money on your online shopping.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className='max-w-10xl mx_auto'>
          <Navbar />
          <FavoritesSidebar />     

        {children}
      </main>
      <footer>
      <Footer />
      </footer>
      </body>
      
    </html>
  )
}