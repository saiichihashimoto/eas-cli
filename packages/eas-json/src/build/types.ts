import { Android, Cache, Ios, Platform } from '@expo/eas-build-job';

export enum CredentialsSource {
  LOCAL = 'local',
  REMOTE = 'remote',
}

export enum ResourceClass {
  DEFAULT = 'default',
  LARGE = 'large',
  /**
   * @deprecated use M1_MEDIUM instead
   * @experimental
   * This resource class is not yet ready to be used in production. For testing purposes only. Might be deprecated / deleted at any time.
   */
  M1_EXPERIMENTAL = 'm1-experimental',
  M1_MEDIUM = 'm1-medium',
  M1_LARGE = 'm1-large',
  INTEL_MEDIUM = 'intel-medium',
  MEDIUM = 'medium',
}

export type DistributionType = 'store' | 'internal';

export type IosEnterpriseProvisioning = 'adhoc' | 'universal';

export type VersionAutoIncrement = boolean | 'version';
export type IosVersionAutoIncrement = VersionAutoIncrement | 'buildNumber';
export type AndroidVersionAutoIncrement = VersionAutoIncrement | 'versionCode';

export interface CommonBuildProfile {
  // builder
  resourceClass?: ResourceClass;

  // build environment
  env?: Record<string, string>;
  node?: string;
  yarn?: string;
  expoCli?: string;

  // credentials
  credentialsSource: CredentialsSource;
  distribution: DistributionType;

  // updates
  releaseChannel?: string;
  channel?: string;

  // build configuration
  developmentClient?: boolean;
  prebuildCommand?: string;

  // versions
  autoIncrement?: boolean;

  // artifacts
  buildArtifactPaths?: string[];

  // cache
  cache?: Omit<Cache, 'clear'>;

  // custom build configuration
  config?: string;
}

interface PlatformBuildProfile extends Omit<CommonBuildProfile, 'autoIncrement'> {
  // artifacts
  /**
   * @deprecated use applicationArchivePath
   */
  artifactPath?: string;
  applicationArchivePath?: string;
}

export interface AndroidBuildProfile extends PlatformBuildProfile {
  // build environment
  image?: Android.BuilderEnvironment['image'];
  ndk?: string;

  // credentials
  withoutCredentials?: boolean;

  // build configuration
  gradleCommand?: string;
  buildType?: Android.BuildType.APK | Android.BuildType.APP_BUNDLE;

  // versions
  autoIncrement?: AndroidVersionAutoIncrement;
}

export interface IosBuildProfile extends PlatformBuildProfile {
  // build environment
  image?: Ios.BuilderEnvironment['image'];
  bundler?: string;
  fastlane?: string;
  cocoapods?: string;

  // credentials
  enterpriseProvisioning?: IosEnterpriseProvisioning;

  // build configuration
  simulator?: boolean;
  scheme?: string;
  buildConfiguration?: string;

  // versions
  autoIncrement?: IosVersionAutoIncrement;
}

export type BuildProfile<TPlatform extends Platform = Platform> = TPlatform extends Platform.ANDROID
  ? AndroidBuildProfile
  : IosBuildProfile;

export interface EasJsonBuildProfile extends Partial<CommonBuildProfile> {
  extends?: string;
  [Platform.ANDROID]?: Partial<AndroidBuildProfile>;
  [Platform.IOS]?: Partial<IosBuildProfile>;
}
