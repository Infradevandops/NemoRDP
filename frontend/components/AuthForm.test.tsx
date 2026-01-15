import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from '@/components/AuthForm';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock properties using getters to simulate next/navigation hooks behavior
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

describe('AuthForm', () => {
    const mockPush = jest.fn();
    const mockSearchParams = { get: jest.fn() };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it('renders login form correctly', () => {
        render(<AuthForm type="login" />);
        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders register form correctly', () => {
        render(<AuthForm type="register" />);
        expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('submits login form with trimmed lowercase email', async () => {
        render(<AuthForm type="login" />);

        // Mock successful fetch
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: 'fake-token' }),
        });

        fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
            target: { value: '  Test@Example.com  ' },
        });
        fireEvent.change(screen.getByPlaceholderText(/password/i), {
            target: { value: 'password123' },
        });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/auth/login'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(URLSearchParams),
                })
            );
        });

        // Check FormData content
        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const formData = callArgs[1].body as URLSearchParams;
        expect(formData.get('username')).toBe('test@example.com');
    });

    it('handles API errors correctly', async () => {
        render(<AuthForm type="login" />);

        // Mock error fetch
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: 'Invalid credentials' }),
        });

        fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
            target: { value: 'user@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/password/i), {
            target: { value: 'wrongpass' },
        });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });
});
