import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { EmailVerificationNotice } from '@/components/auth/EmailVerificationNotice';
import { UserTypeSelector } from '@/components/UserTypeSelector';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeParam = searchParams.get('type') as 'client' | 'master' | null;
  const messageParam = searchParams.get('message');
  const emailParam = searchParams.get('email');
  
  const [showUserTypeSelector, setShowUserTypeSelector] = useState(!typeParam);
  const [selectedUserType, setSelectedUserType] = useState<'client' | 'master' | 'business' | null>(typeParam as 'client' | 'master' | 'business' | null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(emailParam || '');
  const [activeTab, setActiveTab] = useState<string>(typeParam ? "signup" : "login");

  useEffect(() => {
    if (typeParam) {
      setSelectedUserType(typeParam);
      setShowUserTypeSelector(false);
    }
    
    if (messageParam === 'verify-email' && emailParam) {
      setShowEmailVerification(true);
      setPendingEmail(emailParam);
    }
  }, [typeParam, messageParam, emailParam]);

  const handleUserTypeSelect = (type: 'client' | 'master' | 'business') => {
    setSelectedUserType(type);
    setShowUserTypeSelector(false);
    setActiveTab("signup");
  };

  const handleSignUpClick = () => {
    setShowUserTypeSelector(true);
  };

  const handleLoginFromSelector = () => {
    setShowUserTypeSelector(false);
    setActiveTab("login");
  };

  const handleEmailVerificationShow = (email: string) => {
    setShowEmailVerification(true);
    setPendingEmail(email);
  };

  const handleBackFromVerification = () => {
    setShowEmailVerification(false);
    setPendingEmail('');
  };

  const handleClose = () => {
    if (selectedUserType) {
      // Si hay un tipo de usuario seleccionado, volver al selector
      setSelectedUserType(null);
      setShowUserTypeSelector(true);
    } else if (showUserTypeSelector) {
      // Si está en el selector, volver a la página principal
      navigate('/');
    } else {
      // Por defecto, volver a la página principal
      navigate('/');
    }
  };

  // Show email verification notice
  if (showEmailVerification && pendingEmail) {
    return (
      <EmailVerificationNotice 
        email={pendingEmail} 
        onBack={handleBackFromVerification} 
      />
    );
  }

  if (showUserTypeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 z-10"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Únete a Ofiz</h1>
            <p className="text-muted-foreground">Elige cómo quieres usar nuestra plataforma</p>
          </div>
          <UserTypeSelector onSelect={handleUserTypeSelect} onLoginClick={handleLoginFromSelector} />
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Bienvenido a Ofiz</CardTitle>
          <CardDescription>
            Conecta con profesionales de servicios para el hogar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <OAuthButtons />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continúa con
                  </span>
                </div>
              </div>
              
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <OAuthButtons />
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continúa con
                  </span>
                </div>
              </div>
              
              {selectedUserType ? (
                <SignUpForm 
                  userType={selectedUserType} 
                  onBack={() => setSelectedUserType(null)}
                  onEmailVerification={handleEmailVerificationShow}
                />
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Para registrarte, primero elige tu tipo de cuenta
                  </p>
                  <button
                    onClick={handleSignUpClick}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Elegir tipo de cuenta
                  </button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;