"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-state";
import { MockCheckoutModal } from "./mock-checkout-modal";
import { commerceConfig } from "@/config/commerce";

export function PricingExperience() {
  const { user, draft } = useAuth();
  const router = useRouter();
  const [checkout, setCheckout] = useState(false);
  const [notice, setNotice] = useState("");
  const product = commerceConfig.products.starterPack;

  const complete = useCallback(() => {
    setCheckout(false); setNotice(`${product.creationCount} 次完整创作已加入。`);
    if (draft.trim()) router.push("/create");
  }, [draft, product.creationCount, router]);

  return <section className="pricing-page" aria-labelledby="pricing-title">
    <header className="pricing-heading"><p className="eyebrow">ONE QUIET BEGINNING</p><h1 id="pricing-title">继续留下这一刻。</h1><p>当免费体验结束，仍可以把重要的片刻保存下来。</p></header>
    <div className="pricing-spread">
      <div className="creation-preview" aria-label="一次完整创作的作品构成">
        <div className="preview-main"><span /></div><div className="preview-variants"><span /><span /><span /></div>
        <blockquote>有些未说完的话，会以另一种形状留下。</blockquote><small>UNTITLED / A COMPLETE CREATION</small>
      </div>
      <div className="pricing-copy"><p className="eyebrow">STARTER PACK</p><h2>{product.name}</h2><p className="pricing-price"><strong>¥{product.priceCny}</strong><span>{product.creationCount} 次完整创作</span></p>
        <div className="creation-includes"><p>一次完整创作</p><span>主作品</span><span>另一种可能 × 3</span><span>作品说明</span><span>高清下载</span><span>分享卡片</span><span>换一种表达</span></div>
        <button className="generate-button pricing-action" type="button" onClick={() => { setNotice(""); if (user) setCheckout(true); else router.push("/login?returnTo=%2Fpricing"); }}>解锁 {product.creationCount} 次创作 <span aria-hidden="true">↗</span></button>
        <p className="pricing-note">当前为开发环境中的模拟购买，不会产生真实费用。</p><p className="pricing-notice" role="status">{notice}</p>
      </div>
    </div>
    {checkout && user && <MockCheckoutModal userId={user.id} onClose={() => setCheckout(false)} onCompleted={complete} />}
  </section>;
}

