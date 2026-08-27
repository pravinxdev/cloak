import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnvironmentSelector } from "@/components/EnvironmentSelector";
import { useApp } from "@/contexts/AppContext";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Share2, Download, Copy, Check, ShieldCheck } from "lucide-react";

const MIN_SHARE_PASSCODE_LENGTH = 8;
const MAX_SHARE_PASSCODE_LENGTH = 128;

export default function SharePage() {
  const { activeEnvironment, environments, fetchSecrets } = useApp();
  
  // Share state
  const [sharePasscode, setSharePasscode] = useState('');
  const [shareEnv, setShareEnv] = useState(activeEnvironment);
  const [generatedToken, setGeneratedToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Receive state
  const [receiveToken, setReceiveToken] = useState('');
  const [receivePasscode, setReceivePasscode] = useState('');
  const [isReceiving, setIsReceiving] = useState(false);

  useEffect(() => {
    if (activeEnvironment) {
      setShareEnv(activeEnvironment);
    }
  }, [activeEnvironment]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sharePasscode.trim().length < MIN_SHARE_PASSCODE_LENGTH) {
      toast.error(`Passcode must be at least ${MIN_SHARE_PASSCODE_LENGTH} characters`);
      return;
    }
    if (sharePasscode.length > MAX_SHARE_PASSCODE_LENGTH) {
      toast.error(`Passcode must be no more than ${MAX_SHARE_PASSCODE_LENGTH} characters`);
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.generateShareToken(sharePasscode.trim(), shareEnv);
      setGeneratedToken(res.token);
      toast.success(`Share token generated with ${res.count} secret(s)!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate share payload");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedToken) return;
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    toast.success("Token copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveToken.trim() || !receivePasscode.trim()) {
      toast.error("Please enter both token and passcode");
      return;
    }
    if (receivePasscode.length < MIN_SHARE_PASSCODE_LENGTH) {
      toast.error(`Passcode must be at least ${MIN_SHARE_PASSCODE_LENGTH} characters`);
      return;
    }
    if (receivePasscode.length > MAX_SHARE_PASSCODE_LENGTH) {
      toast.error(`Passcode must be no more than ${MAX_SHARE_PASSCODE_LENGTH} characters`);
      return;
    }

    setIsReceiving(true);
    try {
      const res = await api.receiveShareToken(receiveToken.trim(), receivePasscode.trim());
      toast.success(`Imported ${res.importedCount} secret(s) into '${res.environment}' environment!`);
      setReceiveToken('');
      setReceivePasscode('');
      await fetchSecrets();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to import share payload");
    } finally {
      setIsReceiving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Share Secrets</h1>
        <p className="text-muted-foreground">
          Encrypted, zero-knowledge secret bundle sharing across environments.
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Create Bundle
          </TabsTrigger>
          <TabsTrigger value="receive" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Receive Bundle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Package & Encrypt Secrets</CardTitle>
              <CardDescription>
                Generate a base64url payload encrypted with AES-256 using your custom passcode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleGenerate} className="space-y-4">
                <EnvironmentSelector
                  value={shareEnv}
                  onChange={setShareEnv}
                  environments={environments.map((environment) => environment.name)}
                  optional={false}
                />
                <div className="space-y-2">
                  <Label htmlFor="passcode">Encryption Passcode</Label>
                  <Input 
                    id="passcode" 
                    type="password" 
                    value={sharePasscode} 
                    onChange={(e) => setSharePasscode(e.target.value)} 
                    placeholder="At least 8 characters"
                    minLength={MIN_SHARE_PASSCODE_LENGTH}
                    maxLength={MAX_SHARE_PASSCODE_LENGTH}
                    required
                  />
                </div>
                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating ? "Generating..." : "Generate Share Token"}
                </Button>
              </form>

              {generatedToken && (
                <div className="mt-6 p-4 border rounded-md bg-muted/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-sm flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      Encrypted Share Token
                    </Label>
                    <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy Token"}
                    </Button>
                  </div>
                  <textarea
                    readOnly
                    value={generatedToken}
                    rows={4}
                    className="w-full p-2 font-mono text-xs border rounded bg-background resize-none focus:outline-none"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receive">
          <Card>
            <CardHeader>
              <CardTitle>Import Encrypted Bundle</CardTitle>
              <CardDescription>
                Paste a shared `clkx_` token payload and passcode to decrypt into active vault.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReceive} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Share Token (clkx_...)</Label>
                  <textarea
                    id="token"
                    value={receiveToken}
                    onChange={(e) => setReceiveToken(e.target.value)}
                    placeholder="clkx_..."
                    rows={4}
                    className="w-full p-2 font-mono text-xs border rounded bg-background focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivePasscode">Decryption Passcode</Label>
                  <Input 
                    id="receivePasscode" 
                    type="password" 
                    value={receivePasscode} 
                    onChange={(e) => setReceivePasscode(e.target.value)} 
                    placeholder="At least 8 characters"
                    minLength={MIN_SHARE_PASSCODE_LENGTH}
                    maxLength={MAX_SHARE_PASSCODE_LENGTH}
                    required
                  />
                </div>
                <Button type="submit" disabled={isReceiving} className="w-full">
                  {isReceiving ? "Importing..." : "Decrypt & Import Secrets"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
