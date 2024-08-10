#import "AppDelegate.h"
#import "RNFBAppCheckModule.h" // ⬅️ ADD THIS LINE
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import "RNSplashScreen.h"

#import <TSBackgroundFetch/TSBackgroundFetch.h>


@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Add me --- \/
  [RNFBAppCheckModule sharedInstance]; // ⬅️ ADD THIS LINE BEFORE [FIRApp configure]
  [FIRApp configure];
  // Add me --- /\
  
  self.moduleName = @"HeritageProject";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  bool didFinish=[super application:application didFinishLaunchingWithOptions:launchOptions];

  // [REQUIRED] Register BackgroundFetch
  [[TSBackgroundFetch sharedInstance] didFinishLaunching];

  [RNSplashScreen show];
  return didFinish;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
