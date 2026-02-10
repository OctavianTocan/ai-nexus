"use client";

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your information below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={async (event) => {
                    // TODO: This inline fetch needs to be moved to a custom hook.
                    event.preventDefault();
                    const formData = new FormData(event.target as HTMLFormElement);
                    const email = formData.get('email')?.toString() ?? '';
                    const password = formData.get('password')?.toString() ?? '';
                    const confirmPassword = formData.get('confirm-password')?.toString() ?? '';
                    if (password !== confirmPassword) {
                        console.error('Passwords do not match');
                        return;
                    }

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: email, password: password }),
                    });

                    // TODO: Check detail for error. ({"detail":"REGISTER_USER_ALREADY_EXISTS"}
                    // TODO: Check response for success: ({
                    //     "id": "73946aca-98f2-45e8-8690-4da5b62cffbd",
                    //     "email": "tocanoctavian@gmail.com",
                    //     "is_active": true,
                    //     "is_superuser": false,
                    //     "is_verified": false
                    // }))
                    // TODO: If success, redirect back to where the user came from, but with a success message.
                    console.log(response);
                }}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Full Name</FieldLabel>
                            <Input id="name" type="text" placeholder="John Doe" required name="name" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                name="email"
                            />
                            <FieldDescription>
                                We&apos;ll use this to contact you. We will not share your email
                                with anyone else.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input id="password" type="password" required name="password" />
                            <FieldDescription>
                                Must be at least 8 characters long.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="confirm-password">
                                Confirm Password
                            </FieldLabel>
                            <Input id="confirm-password" type="password" required name="confirm-password" />
                            <FieldDescription>Please confirm your password.</FieldDescription>
                        </Field>
                        <FieldGroup>
                            <Field>
                                <Button type="submit">Create Account</Button>
                                {/* <Button variant="outline" type="button">
                                    Sign up with Google
                                </Button> */}
                                <FieldDescription className="px-6 text-center">
                                    Already have an account? <a href="/login">Sign in</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
