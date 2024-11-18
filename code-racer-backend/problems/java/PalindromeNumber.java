public class PalindromeNumber {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for PalindromeNumber...");

        try {
            testIsPalindromeNumber(121, true);
            testIsPalindromeNumber(123, false);
            testIsPalindromeNumber(0, true);
            testIsPalindromeNumber(-121, false);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testIsPalindromeNumber(int input, boolean expected) {
        boolean result = isPalindromeNumber(input);
        if (result != expected) {
            throw new AssertionError("Test failed for input: " + input + 
                ". Expected: " + expected + ", Got: " + result);
        }
    }
}
