import { useState } from "react";
import {
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Text,
  Badge,
  Title,
  Divider,
  Anchor,
  Alert,
  Paper,
  List,
  Code,
  Tabs,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconUser,
  IconLogout,
  IconLogin,
  IconUserPlus,
} from "@tabler/icons-react";
import { useRepositories } from "../../context/RepositoryContext";
import { useAuth } from "../../context/AuthContext";
import { SyncConfig, validateSupabaseUrl } from "../../sync/SyncConfig";
import { getSupabaseClient } from "../../sync/SupabaseClient";
import { getLastSyncedAt } from "../../sync/SyncConfig";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

export function SettingsPage() {
  const { syncConfig, setSyncConfig, syncStatus, pendingOps, failedOps, syncService } = useRepositories();
  const { user, authLoading, authError, signUp, signIn, signOut } = useAuth();
  const { canInstall, isInstalled, triggerInstall } = useInstallPrompt();

  const [url, setUrl] = useState(syncConfig?.supabaseUrl ?? "");
  const [key, setKey] = useState(syncConfig?.supabasePublishableKey ?? "");
  const [testState, setTestState] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [saved, setSaved] = useState(false);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authTab, setAuthTab] = useState<string>("signin");

  const lastSyncedAt = getLastSyncedAt();

  const handleTest = async () => {
    setTestState("testing");
    setTestError("");
    const urlError = validateSupabaseUrl(url.trim());
    if (urlError) {
      setTestState("error");
      setTestError(`Invalid URL: ${urlError}`);
      return;
    }
    try {
      const client = getSupabaseClient({ supabaseUrl: url.trim(), supabasePublishableKey: key.trim() });
      const { error } = await client.from("items").select("id").limit(1);
      if (error) {
        if (error.code === "PGRST116") {
          setTestState("ok");
          return;
        }
        throw new Error("Connection failed: " + error.message);
      }
      setTestState("ok");
    } catch (e) {
      setTestState("error");
      setTestError(String(e));
    }
  };

  const handleSave = () => {
    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();
    if (!trimmedUrl || !trimmedKey) return;
    const urlError = validateSupabaseUrl(trimmedUrl);
    if (urlError) return;
    const config: SyncConfig = { supabaseUrl: trimmedUrl, supabasePublishableKey: trimmedKey };
    setSyncConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDisconnect = () => {
    setSyncConfig(null);
    setUrl("");
    setKey("");
    setTestState("idle");
  };

  const handleSyncNow = () => {
    syncService?.sync();
  };

  const handleSignIn = async () => {
    try {
      await signIn(authEmail, authPassword);
    } catch {
      // error shown via authError
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp(authEmail, authPassword);
    } catch {
      // error shown via authError
    }
  };

  const syncStatusColor =
    syncStatus.state === "syncing" ? "blue" :
    syncStatus.state === "synced" ? "green" :
    syncStatus.state === "error" ? "red" :
    "gray";

  const syncStatusLabel =
    syncStatus.state === "syncing" ? "Syncing…" :
    syncStatus.state === "synced" ? `Synced ${new Date((syncStatus as { at: string }).at).toLocaleTimeString()}` :
    syncStatus.state === "error" ? `Error: ${(syncStatus as { message: string }).message}` :
    syncConfig ? "Idle" : "Not configured";

  return (
    <Stack gap="lg" p="md" pb={80}>

      {/* Install App */}
      {(canInstall || isInstalled) && (
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">Install App</Title>
          {isInstalled ? (
            <Text size="sm" c="dimmed">
              ✓ Inventory Manager is installed on this device and works offline.
            </Text>
          ) : (
            <>
              <Text size="sm" c="dimmed" mb="sm">
                Install this app on your device for quick access and full offline use — no app store needed.
              </Text>
              <Button onClick={triggerInstall}>Install app</Button>
            </>
          )}
        </Paper>
      )}

      {/* Cloud Sync */}
      <Paper p="md" withBorder>
        <Title order={5} mb="sm">Cloud Sync</Title>
        <Text size="sm" c="dimmed" mb="md">
          Connect your own{" "}
          <Anchor href="https://supabase.com" target="_blank" rel="noopener noreferrer">
            Supabase
          </Anchor>{" "}
          project to sync data across devices. Your data stays in your own database.
        </Text>

        {syncConfig && (
          <Group mb="sm">
            <Badge color={syncStatusColor} variant="light">
              {syncStatusLabel}
            </Badge>
            {pendingOps > 0 && (
              <Badge color="orange" variant="light">{pendingOps} pending</Badge>
            )}
          </Group>
        )}

        {failedOps > 0 && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="sm">
            {failedOps} sync operation{failedOps > 1 ? "s" : ""} permanently failed after repeated retries. Some changes may not have synced.
          </Alert>
        )}

        <Stack gap="sm">
          <TextInput
            label="Project URL"
            id="supabase-url"
            type="url"
            placeholder="https://xxxxxxxxxxxx.supabase.co"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setTestState("idle"); setSaved(false); }}
          />
          <PasswordInput
            label="Publishable Key"
            id="supabase-key"
            placeholder="eyJ…"
            value={key}
            onChange={(e) => { setKey(e.target.value); setTestState("idle"); setSaved(false); }}
            description="Find this in your Supabase project under Settings → API → Project API keys."
          />

          {testState === "error" && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">{testError}</Alert>
          )}

          <Group>
            <Button
              variant="default"
              onClick={handleTest}
              disabled={!url.trim() || !key.trim() || testState === "testing"}
              leftSection={testState === "ok" ? <IconCheck size={16} /> : undefined}
            >
              {testState === "testing" ? "Testing…" : testState === "ok" ? "Connection OK" : "Test connection"}
            </Button>

            <Button
              onClick={handleSave}
              disabled={!url.trim() || !key.trim()}
            >
              {saved ? "Saved!" : syncConfig ? "Update" : "Enable sync"}
            </Button>

            {syncConfig && (
              <Button color="red" variant="light" onClick={handleDisconnect}>
                Disconnect
              </Button>
            )}
          </Group>

          {syncConfig && (
            <Group>
              <Button variant="default" onClick={handleSyncNow} disabled={syncStatus.state === "syncing"}>
                Sync now
              </Button>
              {lastSyncedAt && (
                <Text size="xs" c="dimmed">
                  Last synced: {new Date(lastSyncedAt).toLocaleString()}
                </Text>
              )}
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Multi-user: Authentication */}
      {syncConfig && (
        <Paper p="md" withBorder>
          <Title order={5} mb="sm">User Account</Title>
          <Text size="sm" c="dimmed" mb="md">
            Sign in to your Supabase account to keep your data private and separate from other users
            sharing the same Supabase project.
          </Text>

          {user ? (
            <Stack gap="sm">
              <Group>
                <IconUser size={16} />
                <Text size="sm" fw={500}>{user.email}</Text>
                <Badge color="green" size="sm">Signed in</Badge>
              </Group>
              <Button
                variant="light"
                color="gray"
                leftSection={<IconLogout size={16} />}
                onClick={signOut}
                style={{ alignSelf: "flex-start" }}
              >
                Sign out
              </Button>
            </Stack>
          ) : (
            <Stack gap="sm">
              {authError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">{authError}</Alert>
              )}
              <Tabs value={authTab} onChange={(v) => v && setAuthTab(v)}>
                <Tabs.List mb="sm">
                  <Tabs.Tab value="signin" leftSection={<IconLogin size={14} />}>Sign in</Tabs.Tab>
                  <Tabs.Tab value="signup" leftSection={<IconUserPlus size={14} />}>Sign up</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="signin">
                  <Stack gap="sm">
                    <TextInput
                      label="Email"
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                    <PasswordInput
                      label="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                    />
                    <Button
                      leftSection={<IconLogin size={16} />}
                      onClick={handleSignIn}
                      loading={authLoading}
                      disabled={!authEmail || !authPassword}
                      style={{ alignSelf: "flex-start" }}
                    >
                      Sign in
                    </Button>
                  </Stack>
                </Tabs.Panel>
                <Tabs.Panel value="signup">
                  <Stack gap="sm">
                    <TextInput
                      label="Email"
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                    <PasswordInput
                      label="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      description="Use a strong password with at least 8 characters."
                    />
                    <Button
                      leftSection={<IconUserPlus size={16} />}
                      onClick={handleSignUp}
                      loading={authLoading}
                      disabled={!authEmail || !authPassword}
                      style={{ alignSelf: "flex-start" }}
                    >
                      Create account
                    </Button>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          )}
        </Paper>
      )}

      <Divider />

      {/* Setup guide */}
      <Paper p="md" withBorder>
        <Title order={5} mb="sm">Setup guide</Title>
        <List size="sm" spacing="xs">
          <List.Item>
            Create a free project at{" "}
            <Anchor href="https://supabase.com" target="_blank" rel="noopener noreferrer">
              supabase.com
            </Anchor>
          </List.Item>
          <List.Item>
            Open the SQL Editor and run the schema from{" "}
            <Code>supabase/schema.sql</Code> in this repository
          </List.Item>
          <List.Item>
            Copy your <strong>Project URL</strong> and <strong>publishable key</strong> from Settings → API
          </List.Item>
          <List.Item>
            Paste them above and click <strong>Enable sync</strong>
          </List.Item>
          <List.Item>
            Optionally create a user account above for data isolation when sharing a Supabase project
          </List.Item>
        </List>
      </Paper>
    </Stack>
  );
}
