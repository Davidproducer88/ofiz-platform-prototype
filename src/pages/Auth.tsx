import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { UserTypeSelector } from '@/components/UserTypeSelector';
import { useSearchParams } from 'react-router-dom';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as 'client' | 'master' | null;
  
  const [showUserTypeSelector, setShowUserTypeSelector] = useState(!typeParam);
  const [selectedUserType, setSelectedUserType] = useState<'client' | 'master' | null>(typeParam);

  useEffect(() => {
    if (typeParam) {
      setSelectedUserType(typeParam);
      setShowUserTypeSelector(false);
    }
  }, [typeParam]);

  const handleUserTypeSelect = (type: 'client' | 'master') => {
    setSelectedUserType(type);
    setShowUserTypeSelector(false);
  };

  const handleSignUpClick = () => {
    setShowUserTypeSelector(true);
  };

  if (showUserTypeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Únete a Ofiz</h1>
            <p className="text-muted-foreground">Elige cómo quieres usar nuestra plataforma</p>
          </div>
          <UserTypeSelector onSelect={handleUserTypeSelect} />
        </div>
      </div>
    );
  }

  if (selectedUserType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              Registro como {selectedUserType === 'client' ? 'Cliente' : 'Profesional'}
            </CardTitle>
            <CardDescription>
              Completa tus datos para crear tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm 
              userType={selectedUserType} 
              onBack={() => setSelectedUserType(null)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Bienvenido a Ofiz</CardTitle>
          <CardDescription>
            Conecta con profesionales de servicios para el hogar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;