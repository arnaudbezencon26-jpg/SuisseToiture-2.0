import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, ArrowRight, CheckCircle, Shield, Leaf, Droplets, Zap, Home, Building2, HelpCircle, ChevronDown, AlertTriangle, Sparkles, Award, Wrench, Clock, TrendingUp } from 'lucide-react';
import logoPath from '@assets/Logo_Mahmoud-02.png';

function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { handleMove(e.touches[0].clientX); };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden cursor-col-resize select-none shadow-2xl"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
        <div className="text-center text-white">
          <Sparkles className="w-16 h-16 mx-auto mb-3 opacity-80" />
          <p className="text-xl font-bold">APRÈS</p>
          <p className="text-sm opacity-80">Toiture nettoyée à la vapeur</p>
        </div>
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-br from-green-900 to-gray-800 flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <div className="text-center text-white">
          <AlertTriangle className="w-16 h-16 mx-auto mb-3 opacity-80" />
          <p className="text-xl font-bold">AVANT</p>
          <p className="text-sm opacity-80">Mousse, lichen, pollution</p>
        </div>
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
          <div className="flex gap-0.5">
            <ChevronDown className="w-4 h-4 text-[#1a2b5f] -rotate-90" />
            <ChevronDown className="w-4 h-4 text-[#1a2b5f] rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    projectType: '',
    surface: '',
    codePostal: '',
    nom: '',
    telephone: '',
    email: '',
    consent: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectType || !form.surface || !form.telephone || !form.nom) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs obligatoires.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const projectMap: Record<string, string> = { 'maison': 'maison', 'immeuble': 'immeuble', 'autre': 'autre' };
      const surfaceMap: Record<string, number> = { 'moins100': 80, '100-200': 150, 'plus200': 250, 'inconnu': 0 };
      const nameParts = form.nom.trim().split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || '';

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_type: projectMap[form.projectType] || form.projectType,
          service: 'toiture',
          sub_services: ['nettoyage'],
          superficie: surfaceMap[form.surface] || 100,
          nom,
          prenom,
          code_postal: form.codePostal,
          email: form.email,
          telephone: form.telephone,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientEmail: form.email || null,
              clientName: form.nom,
              quoteData: {
                projectType: form.projectType,
                service: 'toiture',
                superficie: surfaceMap[form.surface] || 100,
                adresse: form.codePostal,
                email: form.email,
                telephone: form.telephone,
              },
            }),
          });
        } catch {}
      } else {
        toast({ title: 'Erreur', description: 'Une erreur est survenue. Veuillez réessayer.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la demande. Vérifiez votre connexion.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Demande envoyée avec succès !</h3>
        <p className="text-gray-600 text-lg">Nous vous recontacterons sous 24h avec votre devis personnalisé.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Type de bien *</label>
        <div className="relative">
          <select
            value={form.projectType}
            onChange={(e) => setForm({ ...form, projectType: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-[#e85d2a] focus:ring-[#e85d2a] focus:outline-none appearance-none pr-10"
            required
          >
            <option value="">Sélectionner...</option>
            <option value="maison">Maison individuelle</option>
            <option value="immeuble">Immeuble / Copropriété</option>
            <option value="autre">Autre</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Surface approximative *</label>
        <div className="relative">
          <select
            value={form.surface}
            onChange={(e) => setForm({ ...form, surface: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-[#e85d2a] focus:ring-[#e85d2a] focus:outline-none appearance-none pr-10"
            required
          >
            <option value="">Sélectionner...</option>
            <option value="moins100">Moins de 100 m²</option>
            <option value="100-200">100 - 200 m²</option>
            <option value="plus200">Plus de 200 m²</option>
            <option value="inconnu">Je ne sais pas</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Code postal</label>
        <input
          type="text"
          value={form.codePostal}
          onChange={(e) => setForm({ ...form, codePostal: e.target.value })}
          placeholder="Ex: 1201"
          className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-[#e85d2a] focus:ring-[#e85d2a] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nom & Prénom *</label>
        <input
          type="text"
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          placeholder="Jean Dupont"
          className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-[#e85d2a] focus:ring-[#e85d2a] focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
        <input
          type="tel"
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          placeholder="+41 79 xxx xx xx"
          className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-[#e85d2a] focus:ring-[#e85d2a] focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="votre@email.ch"
          className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:border-[#e85d2a] focus:ring-[#e85d2a] focus:outline-none"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          className="mt-1 w-4 h-4 text-[#e85d2a] border-gray-300 rounded focus:ring-[#e85d2a]"
        />
        <label className="text-sm text-gray-600">
          J'accepte d'être recontacté par SuisseToiture pour mon devis.
        </label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#e85d2a] hover:bg-[#d14e1f] text-white text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
        size="lg"
      >
        {isSubmitting ? 'Envoi en cours...' : 'RECEVOIR MON DEVIS GRATUIT MAINTENANT'}
      </Button>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-2">
        <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Devis gratuit sous 24h</div>
        <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Sans engagement</div>
        <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Intervention Genève & Vaud</div>
        <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> Protection durable</div>
      </div>
    </form>
  );
}

function StickyMobileCTA() {
  const scrollToForm = () => {
    document.getElementById('formulaire')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t-2 border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] px-4 py-3">
      <div className="flex gap-3 max-w-lg mx-auto">
        <a
          href="tel:+41786903334"
          className="flex-1 flex items-center justify-center gap-2 bg-[#1a2b5f] text-white font-bold py-3 rounded-xl text-sm"
        >
          <Phone className="w-4 h-4" />
          Appeler
        </a>
        <button
          onClick={scrollToForm}
          className="flex-1 flex items-center justify-center gap-2 bg-[#e85d2a] text-white font-bold py-3 rounded-xl text-sm"
        >
          <ArrowRight className="w-4 h-4" />
          Demander un devis
        </button>
      </div>
    </div>
  );
}

export default function GoogleAdsLanding() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif" }}>

      {/* Top Bar */}
      <div className="bg-[#1a2b5f] text-white text-sm py-2">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span className="hidden sm:inline">Zone d'intervention : Genève & Vaud</span>
          <a href="tel:+41786903334" className="flex items-center gap-2 hover:text-orange-300 transition-colors font-semibold">
            <Phone className="w-4 h-4" />
            +41 78 690 33 34
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="SuisseToiture - EL Group Sàrl" className="h-10 md:h-12 w-auto" />
          </div>
          <a
            href="tel:+41786903334"
            className="hidden md:flex items-center gap-2 bg-[#e85d2a] hover:bg-[#d14e1f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            +41 78 690 33 34
          </a>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section className="relative bg-gradient-to-br from-[#1a2b5f] via-[#243573] to-[#1a2b5f] text-white py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                Nettoyage Toiture & Façade à Genève et Vaud :{' '}
                <span className="text-[#e85d2a]">La Technologie Vapeur Haute Performance</span>
                {' '}(Sans Pression Agressive).
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                Restaurez l'éclat neuf de votre propriété et stoppez la dégradation de vos tuiles. Procédé 100% écologique, garanti sans produits chimiques.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#formulaire"
                  className="inline-flex items-center justify-center gap-2 bg-[#e85d2a] hover:bg-[#d14e1f] text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  DEMANDER MON DEVIS GRATUIT
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <BeforeAfterSlider />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Before/After */}
      <section className="md:hidden px-4 py-8 bg-gray-50">
        <p className="text-center text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Glissez pour comparer</p>
        <BeforeAfterSlider />
      </section>

      {/* SECTION 2: LE PROBLÈME */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border-l-4 border-[#e85d2a]">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Votre toiture subit une double menace : la nature et les mauvaises méthodes.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              La mousse, le lichen et la pollution ne sont pas juste inesthétiques. Ce sont des parasites qui rendent vos tuiles poreuses et retiennent l'humidité. Pourtant, le "remède" est souvent pire que le mal : <strong>le nettoyage à haute pression (type Kärcher) est proscrit par les fabricants de tuiles</strong>. Il décape la couche protectrice de votre toit, accélère son vieillissement et favorise un retour encore plus rapide de la mousse.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: AGITATION */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Une toiture poreuse est une bombe à retardement pour votre patrimoine.
          </h3>
          <p className="text-center text-gray-600 text-lg mb-10">Si vous ne traitez pas maintenant avec la bonne méthode :</p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-7 h-7 text-red-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-3">Infiltrations insidieuses</h4>
                <p className="text-gray-600 text-sm">L'eau pénètre la structure, menaçant l'isolation et la charpente.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-7 h-7 text-amber-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-3">Perte de valeur immobilière</h4>
                <p className="text-gray-600 text-sm">Une façade terne ou un toit sale dévalorise instantanément votre bien lors d'une estimation.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-3">Coûts exponentiels</h4>
                <p className="text-gray-600 text-sm">Une restauration complète de toiture coûte <strong>10x plus cher</strong> qu'un entretien préventif spécialisé.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 4: LA SOLUTION */}
      <section className="py-14 md:py-20 bg-[#f8fafb]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              L'innovation Vapeur Basse Pression : La puissance de la chaleur, la douceur pour le support.
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              SuisseToiture (EL Group Sàrl) utilise une technologie de pointe unique en Suisse romande. Nous n'utilisons pas la force de l'eau, mais la température. Notre vapeur sèche, projetée à haute température, "cuit" instantanément les racines des mousses et lichens en profondeur, tout en décollant la pollution atmosphérique.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#1a2b5f]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Zéro agression mécanique</h4>
                <p className="text-gray-600 text-sm">Vos tuiles, crépis et joints restent intacts.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Zéro chimie</h4>
                <p className="text-gray-600 text-sm">Aucun ruissellement toxique dans votre jardin ou les nappes phréatiques.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: LES BÉNÉFICES */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Les 5 bénéfices concrets de notre méthode
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, color: 'bg-blue-100 text-[#1a2b5f]', title: 'Rénovation visuelle immédiate', text: 'Votre maison retrouve son aspect "fin de chantier" dès le premier passage.' },
              { icon: Zap, color: 'bg-orange-100 text-[#e85d2a]', title: 'Effet curatif durable', text: 'La chaleur stérilise le support, retardant la repousse des micro-organismes bien plus longtemps qu\'un lavage à l\'eau froide.' },
              { icon: Shield, color: 'bg-green-100 text-green-600', title: 'Protection du matériau', text: 'Contrairement au chlore ou à la javel, la vapeur ne rend pas les tuiles cassantes.' },
              { icon: Leaf, color: 'bg-emerald-100 text-emerald-600', title: 'Respect de vos extérieurs', text: 'Vos plantations, massifs de fleurs et terrasses ne craignent aucune éclaboussure chimique.' },
              { icon: TrendingUp, color: 'bg-purple-100 text-purple-600', title: 'Valorisation financière', text: 'Un toit et une façade impeccables rassurent les banques et les acheteurs potentiels.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${item.color.split(' ')[0]}`}>
                  <item.icon className={`w-5 h-5 ${item.color.split(' ')[1]}`} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">{item.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: QUI SOMMES-NOUS */}
      <section className="py-14 md:py-20 bg-[#1a2b5f] text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Pourquoi choisir SuisseToiture (EL Group Sàrl) ?
            </h2>
            <p className="text-blue-200 text-lg">L'exigence suisse au service de votre habitat.</p>
          </div>
          <p className="text-blue-100 text-center text-lg max-w-3xl mx-auto mb-12 leading-relaxed">
            Nous ne sommes pas des "jardiniers improvisés nettoyeurs", mais des techniciens spécialisés dans l'enveloppe du bâtiment. Basés localement, nous intervenons sur tout l'arc lémanique avec la rigueur que vous attendez.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-[#e85d2a]" />
              </div>
              <h4 className="font-bold text-lg mb-2">Société enregistrée</h4>
              <p className="text-blue-200 text-sm">EL Group Sàrl, une structure fiable et assurée.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#e85d2a]" />
              </div>
              <h4 className="font-bold text-lg mb-2">Devis transparents</h4>
              <p className="text-blue-200 text-sm">Aucun coût caché, prix ferme avant intervention.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-[#e85d2a]" />
              </div>
              <h4 className="font-bold text-lg mb-2">Chantier propre</h4>
              <p className="text-blue-200 text-sm">Nous laissons les lieux impeccables après notre départ (protection des abords, nettoyage des gouttières inclus).</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: CRÉDIBILITÉ */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <blockquote className="text-lg md:text-xl text-gray-700 italic mb-8 leading-relaxed">
              "Nous investissons dans du matériel industriel de pointe pour garantir un résultat que les méthodes artisanales ne peuvent atteindre. La vapeur est aujourd'hui la seule méthode validée pour nettoyer sans éroder."
            </blockquote>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-800 font-semibold text-sm">Assurance RC Pro complète</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-800 font-semibold text-sm">Intervention certifiée Genève & Vaud</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-800 font-semibold text-sm">Matériel autonome (camion équipé)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: URGENCE */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 md:p-12 border border-red-100">
            <Clock className="w-12 h-12 text-[#e85d2a] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              N'attendez pas que les dégâts soient irréversibles.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
              Les mousses actuelles gorgent vos tuiles d'humidité. Avec les cycles de gel/dégel, elles provoquent des micro-fissures invisibles à l'œil nu mais dévastatrices. <strong>Agir aujourd'hui, c'est économiser des milliers de francs</strong> de réparations de toiture demain. Nos plannings se remplissent rapidement en raison de la forte demande saisonnière.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9: CTA FINAL & FORMULAIRE */}
      <section id="formulaire" className="py-14 md:py-20 bg-gradient-to-br from-[#1a2b5f] via-[#243573] to-[#1a2b5f] text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Protégez votre capital immobilier dès aujourd'hui.
              </h2>
              <p className="text-blue-200 text-lg mb-8">
                Obtenez votre diagnostic et votre devis précis sous 24h.
              </p>
              <div className="space-y-4 text-blue-100">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Devis 100% gratuit et sans engagement</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Réponse garantie sous 24 heures</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Intervention rapide Genève & Vaud</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span>Protection durable de votre patrimoine</span>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-blue-200 mb-3">Ou appelez-nous directement :</p>
                <a
                  href="tel:+41786903334"
                  className="inline-flex items-center gap-3 text-2xl font-bold hover:text-[#e85d2a] transition-colors"
                >
                  <Phone className="w-6 h-6" />
                  +41 78 690 33 34
                </a>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-gray-900">
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoPath} alt="SuisseToiture" className="h-8 w-auto filter brightness-0 invert" />
              <span className="text-gray-400 text-sm">EL Group Sàrl</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="tel:+41786903334" className="hover:text-white transition-colors">+41 78 690 33 34</a>
              <span>|</span>
              <span>Genève & Vaud</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</a>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs mt-6">
            &copy; 2025 SuisseToiture - EL Group Sàrl. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />

      {/* Bottom padding for mobile sticky CTA */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
