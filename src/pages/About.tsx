import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";

const About = () => {
  return (
    <Layout>
      <SEO 
        title="Our Story" 
        description="Learn more about Devanshi Collection, our journey since 2026, and our commitment to providing premium fashion for women."
      />
      <div className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 italic">Our Story</h1>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Founded in 2026, Devanshi Collection was born out of a passion for timeless elegance and modern style. 
              We believe that every woman deserves to feel confident and beautiful in what she wears.
            </p>
          </div>
        </div>
      </div>

      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
                alt="Our Workshop" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <h2 className="font-display text-3xl font-bold">Craftsmanship & Quality</h2>
              <p className="font-body text-muted-foreground">
                Each piece in our collection is carefully curated and designed with attention to detail. 
                We source the finest fabrics to ensure comfort and longevity, creating garments that you'll cherish for years to come.
              </p>
              <p className="font-body text-muted-foreground">
                From our ethnic wear to contemporary dresses, we blend traditional craftsmanship with modern silhouettes 
                to offer a unique wardrobe that speaks to the multifaceted woman of today.
              </p>
              <div className="pt-4 grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-display text-2xl font-bold text-primary">5000+</h4>
                  <p className="font-body text-sm text-muted-foreground">Happy Customers</p>
                </div>
                <div>
                  <h4 className="font-display text-2xl font-bold text-primary">200+</h4>
                  <p className="font-body text-sm text-muted-foreground">Unique Designs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-8">Our Mission</h2>
          <p className="font-body text-xl max-w-2xl mx-auto opacity-90 italic">
            "To empower women through fashion that celebrates individuality, elegance, and confidence."
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
