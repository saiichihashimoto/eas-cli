import chalk from 'chalk';

import capitalize from './expodash/capitalize';
import {
  EnvironmentSecretType,
  EnvironmentVariableEnvironment,
  EnvironmentVariableVisibility,
} from '../graphql/generated';
import { promptAsync, selectAsync } from '../prompts';

export async function promptVariableTypeAsync(
  nonInteractive: boolean,
  initialType?: EnvironmentSecretType
): Promise<EnvironmentSecretType> {
  if (nonInteractive) {
    throw new Error('The `--type` flag must be set when running in `--non-interactive` mode.');
  }

  const options = [
    {
      title: 'String',
      value: EnvironmentSecretType.String,
    },
    {
      title: 'File',
      value: EnvironmentSecretType.FileBase64,
    },
  ];

  return await selectAsync('Select the type of variable', options, {
    initial: initialType,
  });
}

export async function promptVariableVisibilityAsync(
  nonInteractive: boolean,
  selectedVisibility?: EnvironmentVariableVisibility | null
): Promise<EnvironmentVariableVisibility> {
  if (nonInteractive) {
    throw new Error(
      'The `--visibility` flag must be set when running in `--non-interactive` mode.'
    );
  }
  return await selectAsync(
    'Select visibility:',
    Object.values(EnvironmentVariableVisibility).map(visibility => ({
      title: capitalize(visibility),
      value: visibility,
      selected: visibility === selectedVisibility,
    }))
  );
}

type EnvironmentPromptArgs = {
  nonInteractive: boolean;
  selectedEnvironments?: EnvironmentVariableEnvironment[];
  availableEnvironments?: EnvironmentVariableEnvironment[];
};

export function promptVariableEnvironmentAsync(
  input: EnvironmentPromptArgs & { multiple: true }
): Promise<EnvironmentVariableEnvironment[]>;
export function promptVariableEnvironmentAsync(
  input: EnvironmentPromptArgs & { multiple?: false }
): Promise<EnvironmentVariableEnvironment>;

export async function promptVariableEnvironmentAsync({
  nonInteractive,
  selectedEnvironments,
  multiple = false,
  availableEnvironments,
}: EnvironmentPromptArgs & { multiple?: boolean }): Promise<
  EnvironmentVariableEnvironment[] | EnvironmentVariableEnvironment
> {
  if (nonInteractive) {
    throw new Error(
      'The `--environment` flag must be set when running in `--non-interactive` mode.'
    );
  }
  if (!multiple) {
    return await selectAsync(
      'Select environment:',
      (availableEnvironments ?? Object.values(EnvironmentVariableEnvironment)).map(environment => ({
        title: environment,
        value: environment,
      }))
    );
  }
  const { environments } = await promptAsync({
    message: 'Select environment:',
    name: 'environments',
    type: 'multiselect',
    choices: Object.values(EnvironmentVariableEnvironment).map(environment => ({
      title: environment,
      value: environment,
      selected: selectedEnvironments?.includes(environment),
    })),
  });
  return environments;
}

export async function promptVariableValueAsync({
  nonInteractive,
  required = true,
  hidden = false,
  initial,
}: {
  nonInteractive: boolean;
  required?: boolean;
  initial?: string | null;
  hidden?: boolean;
}): Promise<string> {
  if (nonInteractive && required) {
    throw new Error(
      `Environment variable needs 'value' to be specified when running in non-interactive mode. Run the command with ${chalk.bold(
        '--value VARIABLE_VALUE'
      )} flag to fix the issue`
    );
  }

  const { variableValue } = await promptAsync({
    type: hidden ? 'password' : 'text',
    name: 'variableValue',
    message: 'Variable value:',
    initial: initial ?? '',
    validate: variableValue => {
      if (!required) {
        return true;
      }
      if (!variableValue || variableValue.trim() === '') {
        return "Environment variable value can't be empty";
      }
      return true;
    },
  });

  if (!variableValue && required) {
    throw new Error(
      `Environment variable needs 'value' to be specifed. Run the command again  with ${chalk.bold(
        '--value VARIABLE_VALUE'
      )} flag or provide it interactively to fix the issue.`
    );
  }

  return variableValue;
}

export async function promptVariableNameAsync(
  nonInteractive: boolean,
  initialValue?: string
): Promise<string> {
  const validationMessage = 'Variable name may not be empty.';
  if (nonInteractive) {
    throw new Error(validationMessage);
  }

  const { name } = await promptAsync({
    type: 'text',
    name: 'name',
    message: `Variable name:`,
    initial: initialValue,
    validate: value => {
      if (!value) {
        return validationMessage;
      }

      if (!value.match(/^\w+$/)) {
        return 'Names may contain only letters, numbers, and underscores.';
      }

      return true;
    },
  });

  if (!name) {
    throw new Error(validationMessage);
  }

  return name;
}
