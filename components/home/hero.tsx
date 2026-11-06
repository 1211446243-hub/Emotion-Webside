import { ThoughtInput } from "./thought-input";

export function Hero() {
  return <section className="hero" id="create" aria-labelledby="hero-title">
    <div className="hero-intro"><p className="eyebrow">A MOMENT, STILL.</p><h1 id="hero-title">此刻，你在想什么？</h1><p className="hero-subtitle">不用整理好语言。</p></div>
    <ThoughtInput />
    <a className="discover" href="#selected"><span>让想法，拥有一种形状</span><span aria-hidden="true">↓</span></a>
    <span className="margin-note" aria-hidden="true">THOUGHTS / FEELINGS / FRAGMENTS</span>
  </section>;
}
