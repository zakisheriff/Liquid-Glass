import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const alt = 'Liquid Glass for Web — open-source React and Next.js components by Zaki Sheriff';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, color: 'white', backgroundImage: 'linear-gradient(145deg, #c7ded5 0%, #6fc8db 28%, #057de1 55%, #0737b6 100%)' }}>
      <div style={{ position: 'absolute', width: 1550, height: 600, left: -100, top: 190, borderTop: '2px solid rgba(255,255,255,0.65)', borderRadius: '50%', transform: 'rotate(-24deg)' }} />
      <div style={{ display: 'flex', fontSize: 92, fontWeight: 700, letterSpacing: -4 }}>Liquid Glass for Web</div>
      <div style={{ display: 'flex', fontSize: 34, marginTop: 24 }}>React & Next.js components. Made to feel alive.</div>
      <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start', marginTop: 46, padding: '18px 28px', borderRadius: 40, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.16)', fontSize: 27 }}>Open source · MIT · Zaki Sheriff</div>
      <div style={{ display: 'flex', position: 'absolute', bottom: 36, right: 52, fontSize: 22 }}>liquidglass.theatom.lk</div>
    </div>,
    size,
  );
}
