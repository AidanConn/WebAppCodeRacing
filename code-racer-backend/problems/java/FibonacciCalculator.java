public class FibonacciCalculator {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for FibonacciCalculator...");

        try {
            testFibonacci(0, 0);
            testFibonacci(1, 1);
            testFibonacci(2, 1);
            testFibonacci(5, 5);
            testFibonacci(10, 55);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testFibonacci(int n, int expected) {
        int result = fibonacci(n);
        if (result != expected) {
            throw new AssertionError("Test failed for n: " + n + ". Expected: " + expected + ", Got: " + result);
        }
    }
}
