interface Secret {
    key: string;
    value?: string;
    tags?: string[];
    expiration?: string;
    environment?: string;
}
export declare class CloakxManager {
    private isAuthenticated;
    private secrets;
    private currentEnv;
    private environments;
    checkAuth(): Promise<boolean>;
    login(password: string): Promise<boolean>;
    logout(): Promise<boolean>;
    loadSecrets(): Promise<Secret[]>;
    getSecret(key: string): Promise<string | null>;
    createSecret(key: string, value: string, tags?: string): Promise<boolean>;
    updateSecret(key: string, value: string): Promise<boolean>;
    deleteSecret(key: string): Promise<boolean>;
    loadEnvironments(): Promise<string[]>;
    switchEnvironment(env: string): Promise<boolean>;
    getSecrets(): Secret[];
    getIsAuthenticated(): boolean;
    getCurrentEnv(): string;
    getEnvironments(): string[];
    private parseSecretsFromOutput;
    private escapeValue;
}
export {};
//# sourceMappingURL=cloakxManager.d.ts.map