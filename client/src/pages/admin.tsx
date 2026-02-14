import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Building, Calendar, MapPin, User, Phone, Mail, MessageSquare, Settings as SettingsIcon, Eye, Lock, Send, FileText, Save } from 'lucide-react';
import { rowToQuote, rowToSettings, getAdminPassword, setAdminPassword, clearAdminPassword, type Quote, type Settings } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AdminAuth } from '@/components/admin-auth';

const statusLabels = {
  en_attente: 'En attente',
  traite: 'Traité',
  annule: 'Annulé'
};

const statusColors = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  traite: 'bg-green-100 text-green-800',
  annule: 'bg-red-100 text-red-800'
};

const serviceLabels = {
  toiture: 'Toiture',
  facade: 'Façade',
  terrasse: 'Terrasse'
};

const projectTypeLabels = {
  maison: 'Maison',
  immeuble: 'Immeuble'
};

function SettingsPanel() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [clientTemplate, setClientTemplate] = useState('');
  const [adminTemplate, setAdminTemplate] = useState('');
  const [activeTab, setActiveTab] = useState('password');

  const pwd = getAdminPassword();

  const { data: settings, isLoading: settingsLoading } = useQuery<Settings | null>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      return rowToSettings(data);
    },
  });

  useEffect(() => {
    if (settings) {
      setAdminEmail(settings.adminEmail || '');
      setClientTemplate(settings.clientEmailTemplate);
      setAdminTemplate(settings.adminEmailTemplate);
    }
  }, [settings]);

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas');
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, type: 'password', currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la modification');
      }
      return newPassword;
    },
    onSuccess: (updatedPassword: string) => {
      setAdminPassword(updatedPassword);
      toast({ title: "Mot de passe modifié", description: "Le mot de passe admin a été mis à jour." });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, type: 'email', adminEmail: adminEmail || null }),
      });
      if (!res.ok) throw new Error('Failed to update email');
    },
    onSuccess: () => {
      toast({ title: "Email mis à jour", description: "L'adresse email a été enregistrée." });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour l'email.", variant: "destructive" });
    },
  });

  const updateTemplatesMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, type: 'templates', clientTemplate, adminTemplate }),
      });
      if (!res.ok) throw new Error('Failed to update templates');
    },
    onSuccess: () => {
      toast({ title: "Templates sauvegardés", description: "Les templates d'email ont été mis à jour." });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de sauvegarder les templates.", variant: "destructive" });
    },
  });

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-swiss-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Mot de passe
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Modifier le mot de passe admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Entrez le mot de passe actuel"
                />
              </div>
              <div>
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le mot de passe"
                />
              </div>
              <Button
                onClick={() => updatePasswordMutation.mutate()}
                disabled={!currentPassword || !newPassword || !confirmPassword || updatePasswordMutation.isPending}
                className="w-full bg-swiss-blue hover:bg-blue-800"
              >
                {updatePasswordMutation.isPending ? 'Modification...' : 'Modifier le mot de passe'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-5 h-5" />
                Configuration email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="admin-email">Email de l'administrateur</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@suissetoiture.ch"
                />
                <p className="text-xs text-swiss-slate mt-1">
                  Cet email recevra une notification pour chaque nouveau devis. Un email de confirmation sera aussi envoyé au client.
                </p>
              </div>
              <Button
                onClick={() => updateEmailMutation.mutate()}
                disabled={updateEmailMutation.isPending}
                className="w-full bg-swiss-blue hover:bg-blue-800"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateEmailMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder l\'email'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Template email client (confirmation)
                </CardTitle>
                <p className="text-sm text-swiss-slate">
                  Variables disponibles : {"{{prenom}}"}, {"{{nom}}"}, {"{{projectType}}"}, {"{{service}}"}, {"{{superficie}}"}, {"{{adresse}}"}, {"{{email}}"}, {"{{telephone}}"}
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={clientTemplate}
                  onChange={(e) => setClientTemplate(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Template HTML pour l'email de confirmation client..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Template email admin (notification)
                </CardTitle>
                <p className="text-sm text-swiss-slate">
                  Variables disponibles : {"{{prenom}}"}, {"{{nom}}"}, {"{{projectType}}"}, {"{{service}}"}, {"{{superficie}}"}, {"{{adresse}}"}, {"{{email}}"}, {"{{telephone}}"}
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={adminTemplate}
                  onChange={(e) => setAdminTemplate(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Template HTML pour la notification admin..."
                />
              </CardContent>
            </Card>

            <Button
              onClick={() => updateTemplatesMutation.mutate()}
              disabled={updateTemplatesMutation.isPending}
              className="w-full bg-swiss-blue hover:bg-blue-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateTemplatesMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder les templates'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AuthenticatedAdminPage({ onLogout }: { onLogout: () => void }) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'quotes' | 'settings'>('quotes');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pwd = getAdminPassword();

  const { data: quotes = [], isLoading } = useQuery<Quote[]>({
    queryKey: ['quotes'],
    queryFn: async () => {
      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) throw new Error('Failed to load quotes');
      const data = await res.json();
      return (data || []).map(rowToQuote);
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: { status: string; notes?: string } }) => {
      const res = await fetch('/api/admin/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd, id, status: updates.status, notes: updates.notes || null }),
      });
      if (!res.ok) throw new Error('Failed to update quote');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({
        title: "Devis mis à jour",
        description: "Le statut du devis a été modifié avec succès.",
      });
      setSelectedQuote(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      });
    },
  });

  const filteredQuotes = quotes.filter(quote => 
    statusFilter === 'all' || quote.status === statusFilter
  );

  const stats = {
    total: quotes.length,
    en_attente: quotes.filter(q => q.status === 'en_attente').length,
    traite: quotes.filter(q => q.status === 'traite').length,
    annule: quotes.filter(q => q.status === 'annule').length,
  };

  const handleUpdateQuote = (status: string, notes?: string) => {
    if (!selectedQuote) return;
    
    updateQuoteMutation.mutate({
      id: selectedQuote.id,
      updates: { status, notes }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-swiss-blue mx-auto mb-4"></div>
          <p className="text-swiss-slate">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-swiss-blue rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration SuisseToiture</h1>
                <p className="text-sm text-swiss-slate">Gestion des demandes de devis</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={activeView === 'quotes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('quotes')}
                className={activeView === 'quotes' ? 'bg-swiss-blue hover:bg-blue-800' : ''}
              >
                <FileText className="w-4 h-4 mr-2" />
                Devis
              </Button>
              <Button
                variant={activeView === 'settings' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('settings')}
                className={activeView === 'settings' ? 'bg-swiss-blue hover:bg-blue-800' : ''}
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Réglages
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {activeView === 'settings' ? (
          <SettingsPanel />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-swiss-slate">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-swiss-blue" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-swiss-slate">En attente</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.en_attente}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-swiss-slate">Traités</p>
                      <p className="text-2xl font-bold text-green-600">{stats.traite}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <SettingsIcon className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-swiss-slate">Annulés</p>
                      <p className="text-2xl font-bold text-red-600">{stats.annule}</p>
                    </div>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Demandes de devis</h2>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="traite">Traité</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              {filteredQuotes.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
                    <p className="text-swiss-slate">
                      {statusFilter === 'all' 
                        ? "Aucune demande de devis n'a été soumise pour le moment."
                        : `Aucune demande avec le statut "${statusLabels[statusFilter as keyof typeof statusLabels]}" trouvée.`
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredQuotes.map((quote) => (
                  <Card key={quote.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {quote.projectType === 'maison' ? (
                              <Home className="w-5 h-5 text-swiss-blue" />
                            ) : (
                              <Building className="w-5 h-5 text-swiss-blue" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Devis #{quote.id} - {projectTypeLabels[quote.projectType as keyof typeof projectTypeLabels]}
                            </CardTitle>
                            <p className="text-sm text-swiss-slate">
                              {format(new Date(quote.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={statusColors[quote.status as keyof typeof statusColors]}>
                            {statusLabels[quote.status as keyof typeof statusLabels]}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedQuote(quote)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir détails
                              </Button>
                            </DialogTrigger>
                            <QuoteDetailDialog 
                              quote={selectedQuote} 
                              onUpdate={handleUpdateQuote}
                              isUpdating={updateQuoteMutation.isPending}
                            />
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-sm text-swiss-slate">
                          <SettingsIcon className="w-4 h-4 mr-2 text-swiss-blue" />
                          <span>{serviceLabels[quote.service as keyof typeof serviceLabels]}</span>
                          <span className="mx-2">&bull;</span>
                          <span>{quote.subServices.join(', ')}</span>
                        </div>
                        <div className="flex items-center text-sm text-swiss-slate">
                          <Home className="w-4 h-4 mr-2 text-swiss-blue" />
                          <span>{quote.superficie} m&sup2;</span>
                        </div>
                        {quote.adresse && (
                          <div className="flex items-center text-sm text-swiss-slate">
                            <MapPin className="w-4 h-4 mr-2 text-swiss-blue" />
                            <span className="truncate">{quote.adresse}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quote.email && (
                          <div className="flex items-center text-sm text-swiss-slate">
                            <Mail className="w-4 h-4 mr-2 text-swiss-blue" />
                            <span className="truncate">{quote.email}</span>
                          </div>
                        )}
                        {quote.telephone && (
                          <div className="flex items-center text-sm text-swiss-slate">
                            <Phone className="w-4 h-4 mr-2 text-swiss-blue" />
                            <span>{quote.telephone}</span>
                          </div>
                        )}
                        {quote.whatsapp && (
                          <div className="flex items-center text-sm text-swiss-slate">
                            <MessageSquare className="w-4 h-4 mr-2 text-swiss-blue" />
                            <span>{quote.whatsapp}</span>
                          </div>
                        )}
                      </div>

                      {quote.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-swiss-slate"><strong>Notes :</strong> {quote.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const pwd = getAdminPassword();
      if (!pwd) {
        setIsVerifying(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd }),
        });
        const result = await res.json();
        if (result.success) {
          setIsAuthenticated(true);
        } else {
          clearAdminPassword();
        }
      } catch {
        clearAdminPassword();
      }
      setIsVerifying(false);
    };
    verifySession();
  }, []);

  const handleLogout = () => {
    clearAdminPassword();
    setIsAuthenticated(false);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-swiss-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <AuthenticatedAdminPage onLogout={handleLogout} />;
}

function QuoteDetailDialog({ 
  quote, 
  onUpdate, 
  isUpdating 
}: { 
  quote: Quote | null; 
  onUpdate: (status: string, notes?: string) => void;
  isUpdating: boolean;
}) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [notes, setNotes] = useState('');

  if (!quote) return null;

  const handleUpdate = () => {
    onUpdate(selectedStatus, notes);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          Devis #{quote.id} - {projectTypeLabels[quote.projectType as keyof typeof projectTypeLabels]}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Project Details */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Détails du projet</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-swiss-slate">Service :</span>
              <span className="font-medium ml-2">{serviceLabels[quote.service as keyof typeof serviceLabels]}</span>
            </div>
            <div>
              <span className="text-swiss-slate">Type :</span>
              <span className="font-medium ml-2">{quote.subServices.join(', ')}</span>
            </div>
            <div>
              <span className="text-swiss-slate">Superficie :</span>
              <span className="font-medium ml-2">{quote.superficie} m²</span>
            </div>
            <div>
              <span className="text-swiss-slate">Date :</span>
              <span className="font-medium ml-2">
                {format(new Date(quote.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </span>
            </div>
          </div>
          {quote.adresse && (
            <div className="mt-2 text-sm">
              <span className="text-swiss-slate">Adresse :</span>
              <span className="font-medium ml-2">{quote.adresse}</span>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Informations de contact</h3>
          <div className="space-y-2 text-sm">
            {quote.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-swiss-blue" />
                <span>{quote.email}</span>
              </div>
            )}
            {quote.telephone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-swiss-blue" />
                <span>{quote.telephone}</span>
              </div>
            )}
            {quote.whatsapp && (
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2 text-swiss-blue" />
                <span>{quote.whatsapp}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Update */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Mettre à jour le statut</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Nouveau statut</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={`Statut actuel: ${statusLabels[quote.status as keyof typeof statusLabels]}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="traite">Traité</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajouter des notes sur ce devis..."
                rows={3}
              />
            </div>

            {quote.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-swiss-slate">
                  <strong>Notes actuelles :</strong> {quote.notes}
                </p>
              </div>
            )}

            <Button 
              onClick={handleUpdate}
              disabled={!selectedStatus || isUpdating}
              className="w-full bg-swiss-blue hover:bg-blue-800"
            >
              {isUpdating ? 'Mise à jour...' : 'Mettre à jour le devis'}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}