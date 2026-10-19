import getpass
import re
import secrets
import string


def generate_password(length = 16, uppercase = True, numbers = True, symbols = True):
    #Generate a password that includes each selected character type.
    lowercase_chars = string.ascii_lowercase
    char_sets = [lowercase_chars]  # Always include lowercase letters.

    if uppercase:
        char_sets.append(string.ascii_uppercase)
    if numbers:
        char_sets.append(string.digits)
    if symbols:
        char_sets.append(string.punctuation)

    if length < len(char_sets):
        raise ValueError(
            f"Length must be at least {len(char_sets)} "
            "to include all selected character types."
        )

    all_chars = "".join(char_sets)

    # Include at least one character from every selected type.
    password_chars = [secrets.choice(chars) for chars in char_sets]

    # Fill the remaining length, then securely shuffle the result.
    password_chars.extend(
        secrets.choice(all_chars) for _ in range(length - len(password_chars))
    )
    secrets.SystemRandom().shuffle(password_chars)

    return "".join(password_chars)


def find_obvious_patterns(password):
    """Return simple warning messages for patterns a person may guess."""
    warnings = []
    lowered = password.lower()

    if re.search(r"(.)\1{2,}", password):
        warnings.append("a character repeats three or more times")

    sequences = ("abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop")
    for sequence in sequences:
        if any(sequence[i:i + 4] in lowered for i in range(len(sequence) - 3)):
            warnings.append("an obvious sequence appears (such as 1234, abcd, or qwer)")
            break

    common_examples = ("password", "letmein", "welcome", "admin", "123456")
    if any(example in lowered for example in common_examples):
        warnings.append("a very common password pattern appears")

    return warnings


def check_password(password):
    """Return a heuristic score from 1 to 5 and suggestions."""
    if not password:
        return 1, ["Enter a password to check."]

    points = 0
    suggestions = []

    # Length points: up to 3.
    if len(password) >= 8:
        points += 1
    if len(password) >= 12:
        points += 1
    if len(password) >= 16:
        points += 1

    if len(password) < 12:
        suggestions.append("Use at least 12 characters; aim for 16 or more.")
    elif len(password) < 16:
        suggestions.append("Consider using 16 or more characters.")

    # Variety points: up to 2.
    character_types = sum([
        any(char.islower() for char in password),
        any(char.isupper() for char in password),
        any(char.isdigit() for char in password),
        any(not char.isalnum() for char in password),
    ])

    if character_types >= 2:
        points += 1
    if character_types >= 3:
        points += 1
    if character_types < 3:
        suggestions.append(
            "Consider using more character types: lowercase, uppercase, "
            "numbers, and symbols."
        )

    warnings = find_obvious_patterns(password)
    if warnings:
        points -= 1
        suggestions.extend(f"Avoid {warning}." for warning in warnings)

    score = max(1, min(5, points))

    if not suggestions:
        suggestions.append("No obvious issues found by this simple checker.")

    return score, suggestions


def main():
    while True:
        print("\nPassword Tool")
        print("1. Generate a password")
        print("2. Check a password")
        print("3. Quit")

        choice = input("Choose 1, 2, or 3: ").strip()

        if choice == "1":
            try:
                length = int(input("Password length (try 16 or more): "))
                uppercase = input("Include uppercase letters? (y/n): ").lower() == "y"
                numbers = input("Include numbers? (y/n): ").lower() == "y"
                symbols = input("Include symbols? (y/n): ").lower() == "y"

                password = generate_password(length, uppercase, numbers, symbols)
                print(f"\nGenerated password: {password}")
            except ValueError as error:
                print(f"Could not generate password: {error}")

        elif choice == "2":
            password = getpass.getpass("Password to check (input hidden): ")
            score, suggestions = check_password(password)

            print(f"\nHeuristic score: {score}/5")
            for suggestion in suggestions:
                print(f"- {suggestion}")

        elif choice == "3":
            print("Thanks for using PawPass!")
            break

        else:
            print("Please choose 1, 2, or 3.")


if __name__ == "__main__":
    main()