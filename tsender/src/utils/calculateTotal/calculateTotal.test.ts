import { describe, expect, it } from "vitest";
import { calculateTotal } from "./calculateTotal";

describe("calculateTotal", () => {
    it("should return 0 for empty input", () => {
        expect(calculateTotal("")).toBe(0);
    });

    it("should handle single number", () => {
        expect(calculateTotal("100")).toBe(100);
    });

    it("should handle newlines", () => {
        expect(calculateTotal("100\n200\n300")).toBe(600);
    });

    it("should handle commas", () => {
        expect(calculateTotal("100,200,300")).toBe(600);
    });

    it("should handle combination of newlines and commas", () => {
        expect(calculateTotal("100\n200,300\n400")).toBe(1000);
    });

    it("should ignore extra whitespace and empty lines", () => {
        expect(calculateTotal(" 100 \n\n , 200 ,\n300 ")).toBe(600);
    });

    it("should ignore invalid numbers", () => {
        expect(calculateTotal("100\nabc\n200")).toBe(300);
    });

    it("should handle negative numbers and decimals", () => {
        expect(calculateTotal("100.5,-50,200.25")).toBeCloseTo(250.75);
    });
});
