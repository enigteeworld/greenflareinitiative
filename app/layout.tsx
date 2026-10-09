import './globals.css';
import './gf-light.css';
import './gf-reference.css';
import './gf-v3.css';
import './gf-entry.css';
import BrandPreloader from './components/BrandPreloader';
export const metadata={title:'GreenFlare | Make every action count',description:'Track recycling activity, grow your Green Score and build habits that make a difference.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><BrandPreloader/>{children}</body></html>}
