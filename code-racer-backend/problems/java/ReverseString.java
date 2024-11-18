public class ReverseString {

    // User needs to implement this method

    public static void main(String[] args) {
        // Predefined test cases
        System.out.println("Running tests for ReverseString...");

        try {
            testReverseString("hello", "olleh");
            testReverseString("racecar", "racecar");
            testReverseString("  abc  ", "cba");
            testReverseString("", "");
            testReverseString("Java", "avaJ");

            System.out.println("All tests passed!");
        } catch (AssertionError e) {
            System.err.println(e.getMessage());
        }
    }

    // Helper method for testing
    private static void testReverseString(String input, String expected) {
        String result = reverseString(input.trim());
        if (!result.equals(expected)) {
            throw new AssertionError("Test failed for input: \"" + input + "\". Expected: \"" + expected + "\", Got: \"" + result + "\"");
        }
    }
}

