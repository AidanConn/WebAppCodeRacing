public class SumOfDigits {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for SumOfDigits...");

        try {
            testSumOfDigits(0, 0);
            testSumOfDigits(123, 6);
            testSumOfDigits(987, 24);
            testSumOfDigits(1001, 2);
            testSumOfDigits(9999, 36);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testSumOfDigits(int input, int expected) {
        int result = sumOfDigits(input);
        if (result != expected) {
            throw new AssertionError("Test failed for input: " + input + ". Expected: " + expected + ", Got: " + result);
        }
    }
}
