import env from "../../utils/env"
import "./Footer.css"

const BASE_URL = "https://shikshagraha.org"

function Footer() {
  return (
    <div>
      <section className="footer">
        <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Screenshot-2024-11-26-at-7.38.52-PM.png" loading="lazy" className="footer-image1" />
        <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Screenshot-2024-11-26-at-11.44.18-PM.png" loading="lazy" data-w-id="a7405d4d-2923-be0a-93fd-74913b70c592" alt="" className="footer-image2" />
        <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Screenshot-2024-11-26-at-11.45.14-PM.png" loading="lazy" data-w-id="8f4aa99c-5095-c687-30be-e260f0e43823" alt="" className="footer-image3" />
        <div className="frame up sx">
          <div className="fotter-f swd">
            <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-232-1.svg" loading="lazy" alt="" className="image-25" />
            <h2 className="small da">
              <a href={`${BASE_URL}/systemic-leadership-collective`} className="d">
                Systemic Leadership Collective <br />
              </a>
              <a href={`${BASE_URL}/youth-leadership`} className="d">
                Youth Leadership Collective <br />
              </a>
              <a href={`${BASE_URL}/women`} className="d">
                Women Leadership Collective
              </a>
            </h2>
          </div>
          <div className="fotter-f xas kk asdf">
            <h2 className="small da">
              <a href={`${BASE_URL}/about-us`} aria-current="page" className="d w--current">
                About Us <br />
              </a>
              <a href={`${BASE_URL}/awards`} aria-current="page" className="d w--current">
                Shikshagraha Awards
                <br />
              </a>
              <a href={env.RECORD_STORY_URL()} target="_blank" className="d">
                Record Your Story
              </a>
              <a href={`${BASE_URL}/knowledge-hub`} className="d">
                Knowledge Hub
              </a>
            </h2>
          </div>
          <div className="fotter-f xas kk jn">
            <h2 className="small da">
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSfSX2bzdJzPBOlstfGg7vWqPFaS5weLnPpwIieR1DBdRgepPg/viewform" target="_blank">
                Join The Movement
              </a>
              <br />
            </h2>
            <div className="div-block-85">
              <a href="https://www.instagram.com/shikshagraha/" target="_blank" className="w-inline-block">
                <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-16.svg" loading="lazy" alt="" className="image-14" />
              </a>
              <a href="https://www.linkedin.com/company/shikshagraha/" target="_blank" className="w-inline-block">
                <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-12.svg" loading="lazy" alt="" className="image-14" />
              </a>
              <a href="https://www.facebook.com/shikshagraha" target="_blank" className="w-inline-block">
                <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Group-14.svg" loading="lazy" alt="" className="image-14" />
              </a>
              <a href="https://x.com/Shikshagraha" target="_blank" className="w-inline-block">
                <img src="https://shikshagraha.org/wp-content/themes/twentytwentythree-child/images/Image-39.png" loading="lazy" alt="" className="image-14" />
              </a>
              <a href=" https://www.youtube.com/@shikshagraha" target="_blank" className="w-inline-block">
                <img src="https://shikshagraha.org/wp-content/uploads/2024/09/youtube-2.png" loading="lazy" alt="" className="image-14" />
              </a>
            </div>
          </div>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSfSX2bzdJzPBOlstfGg7vWqPFaS5weLnPpwIieR1DBdRgepPg/viewform" target="_blank" className="fotter-f join w-inline-block">
            <h2 className="small da dcd">Join Shikshagraha for every step towards education</h2>
            <h2 className="small da cdc">Join Us</h2>
          </a>
        </div>
      </section>
    </div>
  )
}

export default Footer
