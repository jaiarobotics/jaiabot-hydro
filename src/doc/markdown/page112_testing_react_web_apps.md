# Testing React Web Apps

- [Testing React Web Apps](#testing-react-web-apps)
  - [Introduction](#introduction)
  - [Resources](#resources)
  - [Basic Testing Stragedies](#basic-testing-stragedies)
    - [Unit Testing](#unit-testing)
    - [Integration Testing](#integration-testing)
    - [Functional Testing](#functional-testing)
  - [Test File Stucture](#test-file-stucture)
  - [Anatomy of a React Test](#anatomy-of-a-react-test)
    - [Setting up the Test](#setting-up-the-test)
      - [Props](#props)
      - [Mocks](#mocks)
      - [Declaring the Test](#declaring-the-test)
    - [Rendering the Component](#rendering-the-component)
      - [Re-Rendering](#re-rendering)
    - [Accessing React Elements](#accessing-react-elements)
    - [Triggering Elements](#triggering-elements)
      - [Asynchronous Behavior](#asynchronous-behavior)
    - [Verifying Element Behavior](#verifying-element-behavior)
    - [Verifying Component Outputs](#verifying-component-outputs)
      - [Using jest.fn()](#using-jestfn)
      - [Checking Values of Modified Props](#checking-values-of-modified-props)
  - [More on Mocking](#more-on-mocking)
    - [Mocking a Class](#mocking-a-class)
    - [Mocking Partials](#mocking-partials)

## Introduction

JaiaBot User Interfaces JCC, JED, JDV are all React Applications written in Typescript and Javascript. To test these applications we are using Jest as the foundation Testing Framework with the React Testing Library providing ways to interact with React Components. These tools can be used to create unit tests, integration tests and functional tests.

This document is meant to serve as a starting point for people new to Jest and React Testing Library (RTL). We are still learning the ins and outs of using these tools so our approach and techniques will evolve as we learn. Please update this page with additional information if you learn a new way to do things or exercise more aspects of our applications.

## Resources

[Jest Documentation](https://jestjs.io/docs/getting-started)

[React Testing Library](https://testing-library.com/docs/)

## Basic Testing Stragedies

Using RTL we want to ensure that our user interfaces work as intended under all circumstances.

### Unit Testing

Unit Testing focuses on a specific software entitiy in isolation and exercises it's functionality by varying inputs and verifying expected outputs. In general the entitiy will be on of our Container modules and the focus of the test may be specific to an individual element in that container. The inputs of any given test are comprised of the Props passed into the container, and simulated user actions. The outputs of the test are comprised of updates to props via the use of callback methods and changes to the visual components of the container being tested. An important concept in Unit Testing is exercising "Edge Conditions". Edge Conditions are sets of inputs and actions that present unique situations likely to cause problems for software. Think "how many different ways does this container need to render?"

### Integration Testing

Integration Testing is similar but focuses on the interaction of multiple softeware entities. The test will exercise functiionality of one container and verfiy it's impact on an element of another container. Think "What happens in that container if I do this in this container?"

### Functional Testing

Functional Testing is focused on a exercising a particular function of the application. Functional tests typically exercise multiple containers and componetns to achieve a certain goal condition. Think "what are the steps involved in achieving this result?"

## Test File Stucture

Test files should be named the same as the item being tested with `.test` inserted before the file suffix.
Unit Tests should be located with the item being tested in a special directory named `__tests__`

For example

```
CommandControl/
├── CommandControl.less
├── CommandControl.tsx
└── __tests__
    └── CommandControl.test.tsx
```

## Anatomy of a React Test

Testing a React Component is broken down to a basic set of steps.

1. [Set Up Test](#setting-up-the-test)
2. [Render the Component under test](#rendering-the-component)
3. [Get access to one or more React Element of the component](#accessing-react-elements)
4. [Trigger some event(s) on the Element(s)](#triggering-elements)
5. [Verify the behavior Element(s)](#verifying-element-behavior)
6. [Verify the outputs of the Component](#verifying-component-outputs)

### Setting up the Test

For a Component Test to function properly several things must be considered. We are trying to test a specific piece of the application in isolation, however it needs some context to operate properly.

#### Props

You will need to determine the minimum set of Prop Parameters for the Component to function properly. This will depend on the specific functionality being tested. Props can be declared statically, created dynamically in the test or read in from files. Typically you will need to provide any data needed to put the compenent in the correct state and callback methods to verify results and support the component behavior.

```
const mockProps: Props = {
    isEditMode: true,
    enableEcho: false,
    onChange: (task?: MissionTask) => mockOnChange(task),
};
```

#### Mocks

The word `mock` should be used when declaring items used to stand in for things outside of the unit(s) being tested. Mocks come in many flavors. You can mock variables, methods and entire modules as needed (more on that later).

```
const defaultProps: Props = {
    isEditMode: true,
    enableEcho: false,
    onChange: (task?: MissionTask) => mockOnChange(task),
};

let mockProps: Props = defaultProps;

//Mock of the onChange callback to update Props
const mockOnChange = jest.fn().mockImplementation((task?: MissionTask) => {
    mockProps.task = task;
});
```

#### Declaring the Test

Tests are objects that include a test method that get run using the tools from `jest` and RTL. The keyword `test` or `it` is used to declare a test object. The attributeS of a Test are a `description` followed by a test method and then an optional timeout value. Tests methods should be declared using Arrow Function syntax.

Example of complete simple test

```
test("JaiaAbout links to company website", () => {
    render(<JaiaAbout metadata={sampleMetadata1} />);
    const element = screen.getByText("www.jaia.tech");
    expect(element).toHaveAttribute("href", "https://www.jaia.tech");
});
```

### Rendering the Component

RTL uses the `jsdom` to simulate rendering of components just as the usual DOM would render it in a browser. The `jsdom` includes special hooks and methods to support testing.

```
render(<JaiaAbout metadata={sampleMetadata1} />);
```

#### Re-Rendering

Unlike the usual DOM `jsdom` does not automaticall re-render components based on changes to Props or Context. Most of our components are "controlled components", meaning their state is controlled by props and functionality is provided by callback method. This means we need to explicitly re-render a component under test to affect changes to it. The render method of RTL returns a reference to the rendered object which includes a rerender method.

```
// Get the rerender method from the object returned when rendering the panel
const { rerender } = render(<TaskSettingsPanel {...mockProps} />);

// Rerender with updated props
rerender(<TaskSettingsPanel {...mockProps} />);
```

### Accessing React Elements

RTL provides many different ways to query the rendered component to get access to a specific element. [About Queries](https://testing-library.com/docs/queries/about)
The object `screen` represents the rendered object being tested. The most common queries are listed below. In general these use attributes of the element already existing in the code.

- getByRole
- getByText
- getByLabelText
- getByAltText
- getByTitle

In general it is best to query using something visible to the user to make tests more consistent with how a user would use the application. In some cases this can be difficult or impossible. In those cases we can use a special attribute called `
data-testid`. This is generally considered a last resort since this attribute has no corresponding use in the real application.

- getByTestId

Example Button

```
<Button
    aria-label="Go To Rally Point Label"
    // testid to be used as last resort
    data-testid="go-to-rally-point-id"
    title="Go To Rally Point Button"
    className={"button-jcc"}
    onClick={() => props.goToRallyPoint(props.selectedRallyFeature)}
>
```

These methods all return a reference to the same Button Object

```
screen.getByTestId("go-to-rally-point-id");
screen.getByLabelText("Go To Rally Point Label");
screen.getByTitle("Go To Rally Point Button");
```

### Triggering Elements

Once you have access to an element you will need to trigger it somehow to make the component do something. There are two ways to trigger an element.

- [fireEvent method](https://testing-library.com/docs/dom-testing-library/api-events)
- [user-event library](https://testing-library.com/docs/user-event/intro)

In general we always want to use the methods in the user-event companion library. `fireEvent` creates DOM events directly. `user-event` more closely emulates user interactions in a browser, which may trigger more than one DOM Event.

Triggering the Button Element described above

```
// Click the button
await userEvent.click(buttonElement);
```

#### Asynchronous Behavior

Many aspects of React applications run asynchronously so browsers do not lock up waiting for something to change. In general anything that would return a promise is asyncrhonous. For this reason we want to declare most of our tests as aynchronous methods.

```
test("JaiaToggle switching on/off", async () => {
    ...
});
```

And because things are asynchronous we may have to wait for things to happen before continueing the test. See [Waiting for appearance](https://testing-library.com/docs/guide-disappearance).

This is why we have `await` in front of the call to `userEvent.click` above. This allows the test to wait until the promise is fulfilled before going further. In some cases we need to wrap the method with `waitfor` as well.

```
// Verify that the selected value is correct
await waitFor(() => {
        expect(selectElement.value).toBe(newValue);
});
```

This may take some trial and error to get right at first. Here are 2 discussions on the subject of asynchronous testing.

- [Do I need await before every userEvent call?](https://github.com/testing-library/user-event/discussions/1050)
- [Re-thinking approach to async event handling](https://github.com/testing-library/user-event/issues/504)

### Verifying Element Behavior

We often want to test that the visual elements of our components behave correctly. In general we should always verify certain attributes of an element we expect to change from a trigger event. We may also want to verify elements are displayed correctly after rendering as well. Jest provides an `expect` method for making assertions. (note `assert` from `Node.js` can be used if needed but is not recommended)

Assert an element is rendred and has correct value

```
const selectElement: HTMLSelectElement = screen.getByTestId("task-select-input-id");
expect(selectElement).toBeInTheDocument();
expect(selectElement.value).toBe(previousValue)
```

Assert an element has changed after re-rendering

```
// Rerender with updated props
rerender(<TaskSettingsPanel {...mockProps} />);

// Verify that the selected value is correct
await waitFor(() => {
    expect(selectElement.value).toBe(newValue);
});
```

Other examples

```
expect(element).toHaveAttribute("href", "https://www.jaia.tech");
expect(panelElement).not.toBeVisible();
expect(toggle.disabled).toBe(true);
```

### Verifying Component Outputs

As stated above most of our components are controlled and therefore the outputs of them are passed as parameters to callback methods provided in the Props. In general we create mock callback methods for our tests. These can be declared in the test object itself, outside the test object or in a different file. It depends on the scope and reusability of the mock callback which makes the most sense.

#### Using jest.fn()

Jest provides a convenient function for declaring mocks that can be overloaded as needed. The benefit of declaring your mocks as jest.fn is Jest provides a bunch of helper functions and attributes that can be used to verify how the callback has been used.

```
const mockGoToRallyPoint = jest.fn();
expect(mockGoToRallyPoint).toHaveBeenCalledTimes(1);
expect(mockGoToRallyPoint).toHaveBeenLastCalledWith(mockProps.selectedRallyFeature);
```

When declaring a mock using `jest.fn` you can also provide some mock implementation.

Modifying Props in a mock callback example

```
//Mock of the onChange callback to update Props
const mockOnChange = jest.fn().mockImplementation((task?: MissionTask) => {
    mockProps.task = task;
});
```

In some cases you may want to create a wrapper container around the component to test that can maintain state.

```
function AccordionTestComponent(props: Props) {
    const [isExpanded, setIsExpanded] = useState(false);

    function onChange() {
        setIsExpanded(!isExpanded);
        props.onChange();
    }

    return (
        <Accordion expanded={isExpanded} onChange={onChange}>
            <AccordionSummary>
                <Typography>Accordion Title Here</Typography>
            </AccordionSummary>
            <AccordionDetails>Accordion Details Here</AccordionDetails>
        </Accordion>
    );
}
```

#### Checking Values of Modified Props

Becasue most of our components are controlled by their parents one way to verify data is to check the Props after they have been modified by the callback method. This would typicaly be done with a `rerender` call when you are also checking changes to the elements. You can do this directly in the test or in a separate 'helper' method.

Here we are checking an updated `task` Prop has been created correctly

```
switch (task?.type) {
    case TaskType.CONSTANT_HEADING:
        // Make sure all the parameters are defined
        expect(task.constant_heading).toBeDefined();
        expect(task.constant_heading.constant_heading).toBeDefined();
        expect(task.constant_heading.constant_heading_speed).toBeDefined();
        expect(task.constant_heading.constant_heading_time).toBeDefined();
        // None of these should be present
        expect(task.dive).toBeUndefined();
        expect(task.station_keep).toBeUndefined();
        expect(task.surface_drift).toBeUndefined();
        break;
```

## More on Mocking

A very common use of mocks is to replace things that use a lot of resources or exercise external interfaces that are not need for the test with mocks that take their place in the test environment. This makes the tests run faster and avoids potential issues timing out waiting for external events.

We are still evolving in out use of mocks. Detailed informaiton is available here [Jest Mock Functions](https://jestjs.io/docs/mock-functions). Please update this section if you learn a new way of using mocks.

### Mocking a Class

`CommandControl.tsx` Imports and uses `CustomLayerGroupFactory` to create map layers that require data downloaded from the web at run time. We do not need these for our tests and do not want our tests to depend on data being downloaded from the web. We don't want to modify the source code being tested so we create a mock to take the place of `CustomLayerGroupFactory`. General mocks like this should be placed in the `src/web/tests/__mocks__/` directory

`src/web/tests/__mocks__/customLayers.mock.ts`

Here we have create a mock of the MockCustomLayerGroupFactory class and the methods needed to support our test

```
// Mock the CustomLayers, replace  createCustomLayerGroup
// Create a mock class for CustomLayerGroupFactory
const MockCustomLayerGroupFactory = jest.fn().mockImplementation(() => ({
    // Mock all methods or properties used by the module under test
    createCustomLayerGroup: jest.fn().mockResolvedValue(undefined), // Example method
    on: jest.fn(), // Mock event subscription
    off: jest.fn(), // Mock event unsubscription
}));

module.exports = {
    CustomLayerGroupFactory: MockCustomLayerGroupFactory,
};
```

Using the Mock in `src/web/containers/CommandControl/__tests__/CommandControl.test.tsx`

```
// Mock the CustomLayers, replace  createCustomLayerGroup
jest.mock("../../../openlayers/map/layers/geotiffs/CustomLayers", () =>
    require("../../../tests/__mocks__/customLayers.mock.ts"),
);
```

### Mocking Partials

Sometimes we want to mock part of a module in our test to avoid costly operations that are not needed for the test but do not need or want to mock the entire module. In this case we need to only need a partial mock of the module.

The `JaiaAPI` is a good example of this. The `JaiaAPI` class includes many methods used throughout our code. However all external communication is handled by the `hit` method. Rather than mocking every method in the class and trying to figure out what implementation may be needed for each one we want to simply replace the `hit` method with a mock and use the rest of the real `JaiaAPI` class. We use the `jest.requireActual` function to achieve this.

`src/web/tests/__mocks__/jaiaAPI.mock.ts`

Here we tell jest we want to use the real `JaiaAPI` class from `src/web/utils/jaia-api.ts` but replace it's `hit` method with a mock that returns a mocked response.

```
// Mock JaiaAPI, replace the hit method on the jaiaAPI instance
// Import the real module to access the original jaiaAPI instance
const originalModule = jest.requireActual("../../utils/jaia-api");

originalModule.jaiaAPI.hit = jest
    .fn()
    .mockResolvedValue({ code: 200, msg: "Mocked Success", bots: [], hubs: [] });

module.exports = {
    ...originalModule, // Spread the real module
    jaiaAPI: originalModule.jaiaAPI, // Keep the original jaiaAPI instance with the mocked hit
};
```

## Test Suites
