import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/footer';
import { Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import logoPath from '@assets/Logo_Mahmoud-02.png';

export default function RemerciementPage() {
  return (
    <div className="min-h-screen bg-swiss-light">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="/">
                <img 
                  src={logoPath} 
                  alt="SuisseToiture Logo" 
                  className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </a>
              <div>
                <p className="text-sm text-swiss-slate">
                  Nettoyage écologique à vapeur
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-swiss-slate">
              <a href="tel:+41786903334" className="flex items-center hover:text-swiss-blue transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                +41 78 690 33 34
              </a>
              <a href="mailto:info@suissetoiture.ch" className="flex items-center hover:text-swiss-blue transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                info@suissetoiture.ch
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Merci pour votre demande !
          </h1>
          <p className="text-xl text-swiss-slate mb-8">
            Votre demande de devis a été transmise avec succès.
          </p>

          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Et maintenant ?
              </h2>
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-swiss-blue text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <p className="text-swiss-slate">Notre équipe analyse votre demande dans les prochaines heures.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-swiss-blue text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <p className="text-swiss-slate">Nous vous recontactons sous 24h avec un devis personnalisé.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-swiss-blue text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <p className="text-swiss-slate">Si le devis vous convient, nous planifions l'intervention à votre convenance.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-swiss-blue hover:bg-blue-800">
                Retour à l'accueil
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="tel:+41786903334">
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Appeler maintenant
              </Button>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
