public class FactorialCalculator {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for FactorialCalculator...");

        try {
            testFactorial(0, 1);
            testFactorial(1, 1);
            testFactorial(5, 120);
            testFactorial(10, 3628800);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testFactorial(int n, int expected) {
        int result = factorial(n);
        if (result != expected) {
            throw new AssertionError("Test failed for n: " + n + ". Expected: " + expected + ", Got: " + result);
        }
    }
}
