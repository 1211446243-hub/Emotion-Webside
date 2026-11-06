import Link from "next/link";
export default function NotFound() { return <section className="collection-empty"><p className="eyebrow">404</p><h1>这里什么也没有留下。</h1><Link className="quiet-link" href="/">返回首页 ↗</Link></section>; }
