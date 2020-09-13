import { sanitizeBucket, parseSource } from "./utils";

const buckets = [
  { input: "pkg.example.com", output: "gs://pkg.example.com/" },
  { input: "gs://pkg.example.com", output: "gs://pkg.example.com/" },
  { input: "gs://pkg.example.com/", output: "gs://pkg.example.com/" },
];

for (const { input, output } of buckets) {
  it(`sanitizeBucket(${input}) => ${output}`, () => {
    expect(sanitizeBucket(input)).toEqual(output);
  });
}

it("sanitizeBucket(s3://pkg.example.com)", () => {
  const error =
    "Only Google Cloud Storage buckets are supported at the moment.";
  expect(() => sanitizeBucket("s3://pkg.example.com")).toThrowError(error);
});

[
  [
    ["dist/app.zip", "123"],
    ["dist/app.zip", "app_123.zip"],
  ],
  [
    ["dist/app.zip:app_test.zip", "123"],
    ["dist/app.zip", "app_test.zip"],
  ],
  [
    ["dist/app.zip:app_{version}_test.zip", "123"],
    ["dist/app.zip", "app_123_test.zip"],
  ],
].forEach(([input, output]) => {
  it(`parseSource(${input[0]}, ${input[1]}) => [${output[0]}, ${output[1]}]`, () => {
    const result = parseSource(input[0], input[1]);
    expect(result).toMatchObject(output);
  });
});
