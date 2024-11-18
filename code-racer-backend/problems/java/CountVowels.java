public class CountVowels {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for CountVowels...");

        try {
            testCountVowels("hello world", 3);
            testCountVowels("AEIOU", 5);
            testCountVowels("bcdfg", 0);
            testCountVowels("Java Programming", 5);
            testCountVowels("", 0);

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testCountVowels(String input, int expected) {
        int result = countVowels(input);
        if (result != expected) {
            throw new AssertionError("Test failed for input: \"" + input + "\". Expected: " + expected + ", Got: " + result);
        }
    }
}
