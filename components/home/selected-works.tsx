const studies = [
  { name: "dusk", label: "赭色的旷野与暮色，远方一道微光", quote: "远方，也可以是一种停留。", number: "01", theme: "关于远方" },
  { name: "window", label: "深绿灰色的房间里，一扇窗透进柔和的光", quote: "什么也没发生，光还是经过了这里。", number: "02", theme: "关于日常" },
  { name: "sea", label: "灰蓝色的海面与淡淡的地平线", quote: "有些答案，暂时是空白的。", number: "03", theme: "关于未知" },
];

export function SelectedWorks() {
  return <section id="selected" className="selected-works" aria-labelledby="selected-title">
    <div className="section-heading"><div><p className="eyebrow">FORMS OF A THOUGHT</p><h2 id="selected-title">有些想法，会变成另一种形状。</h2></div><span className="study-label">意象习作 / 视觉占位</span></div>
    <div className="studies-grid">{studies.map((study) => <figure className="study" key={study.name}>
      <div className={`art-study art-${study.name}`} role="img" aria-label={study.label}><span className="art-light" /><span className="art-ground" /><span className="art-detail" /></div>
      <figcaption><div className="study-meta"><span>{study.number} / {study.theme}</span><span aria-hidden="true">—</span></div><p>{study.quote}</p></figcaption>
    </figure>)}</div>
    <div className="about-note"><span aria-hidden="true">∗</span><p>我们不解释你的情绪。<br />只是试着让它拥有一种形状。</p><span className="eyebrow">A LITTLE LESS WORDS. A LITTLE MORE FEELING.</span></div>
  </section>;
}
