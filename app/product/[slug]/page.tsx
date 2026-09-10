import { Storefront } from '../../storefront';
export default async function Product({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return <Storefront view="product" slug={slug} />; }
