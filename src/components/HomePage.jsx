import Header from "./header/Header";
import Highlight from "./highlight/Hightlight";
import Description from "./description/Description";
import Footer from "./footer/Footer";
import Gallery from "./gallery/Gallery";

const HomePage = () => {
    return (
        <>
        <Header />
        <Highlight />
        <Gallery />
        <Description />
        <Footer />
        </>
    );
}

export default HomePage;