import type { Metadata } from 'next';
import { Storefront } from '../storefront';

export const metadata: Metadata = {
  title: 'Meet Odin — ÆTY ONE',
  description: 'Meet Odin, the fictional AI character and global artifact hunter at the center of the ÆTY ONE universe.',
};

export default function OdinPage() {
  return <Storefront view="odin" />;
}
