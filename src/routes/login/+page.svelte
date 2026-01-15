<script lang="ts">
    import { goto } from "$app/navigation";
    import { authStore } from "$lib/stores/authStore";
    import { onMount } from "svelte";
    import logo from "$lib/assets/logo.svg";

    let email = $state("");
    let password = $state("");
    let error = $state("");
    let isLoading = $state(false);

    // Redirect if already authenticated
    onMount(() => {
        if (authStore.checkAuth()) {
            goto("/");
        }
    });

    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = "";
        isLoading = true;

        // Small delay for UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        const success = authStore.login(email, password);

        if (success) {
            goto("/");
        } else {
            error = "Invalid email or password";
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Login | Timba Systems</title>
</svelte:head>

<div class="login-container">
    <div class="login-card">
        <div class="logo-container">
            <img src={logo} alt="Timba Systems" class="logo" />
        </div>

        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to your account</p>

        <form onsubmit={handleSubmit}>
            {#if error}
                <div class="error-message">
                    <span class="error-icon">⚠️</span>
                    {error}
                </div>
            {/if}

            <div class="form-group">
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    bind:value={email}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                />
            </div>

            <button type="submit" class="login-button" disabled={isLoading}>
                {#if isLoading}
                    <span class="spinner"></span>
                    Signing in...
                {:else}
                    Sign In
                {/if}
            </button>
        </form>
    </div>
</div>

<style>
    .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1a2332 0%, #151a24 100%);
        padding: 20px;
    }

    .login-card {
        background: white;
        border-radius: 16px;
        padding: 48px;
        width: 100%;
        max-width: 420px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
    }

    .logo-container {
        display: flex;
        justify-content: center;
        margin-bottom: 32px;
    }

    .logo {
        height: 48px;
        filter: brightness(0) saturate(100%) invert(29%) sepia(20%)
            saturate(1000%) hue-rotate(165deg) brightness(90%);
    }

    h1 {
        margin: 0 0 8px 0;
        font-family: "DM Sans", sans-serif;
        font-size: 28px;
        font-weight: 700;
        color: #1a2332;
        text-align: center;
    }

    .subtitle {
        margin: 0 0 32px 0;
        font-size: 14px;
        color: #6b7280;
        text-align: center;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
    }

    .form-group input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 15px;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }

    .form-group input:focus {
        outline: none;
        border-color: #399ea2;
        box-shadow: 0 0 0 3px rgba(57, 158, 162, 0.15);
    }

    .form-group input:disabled {
        background: #f3f4f6;
        cursor: not-allowed;
    }

    .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: #fef2f2;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        color: #dc2626;
        font-size: 14px;
        margin-bottom: 20px;
    }

    .error-icon {
        font-size: 16px;
    }

    .login-button {
        width: 100%;
        padding: 14px 24px;
        background: linear-gradient(135deg, #399ea2 0%, #2d8a8e 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    .login-button:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(57, 158, 162, 0.4);
    }

    .login-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
