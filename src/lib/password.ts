export interface PasswordStrengthResult {
  isValid: boolean;
  score: number;
  errors: string[];
}

const MIN_LENGTH = 8;

const rules: { test: (pw: string) => boolean; message: string }[] = [
  {
    test: (pw) => pw.length >= MIN_LENGTH,
    message: `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`,
  },
  {
    test: (pw) => /[A-Z]/.test(pw),
    message: "A senha deve conter pelo menos 1 letra maiúscula.",
  },
  {
    test: (pw) => /[a-z]/.test(pw),
    message: "A senha deve conter pelo menos 1 letra minúscula.",
  },
  {
    test: (pw) => /[0-9]/.test(pw),
    message: "A senha deve conter pelo menos 1 número.",
  },
  {
    test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pw),
    message: "A senha deve conter pelo menos 1 caractere especial (!@#$%...).",
  },
];

/**
 * Valida a força de uma senha.
 * Retorna se é válida, um score de 0-5, e a lista de erros.
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  let score = 0;

  for (const rule of rules) {
    if (rule.test(password)) {
      score++;
    } else {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    score,
    errors,
  };
}
