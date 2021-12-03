How to set up a new Napi Project
Daniel Albrecht

1. Use following commaned sequence to set up directory
    sudo npm install -g yo
    sudo npm install -g generator-napi-module
    yo napi-module

    Follow prompts. Select 'HelloWorld' template and 'No' for typeScript wrapper

    Note: the name of the target will default to the name of the file folder. You
          can change this by setting up in subfolder with a different name, or 
          edit the 'target_name' variable in the 'binding.gyp' file

2. Update binding.gyp with following:
    - Change target name to desired name
    - Add following lines to 'targets' section
        'cflags': [ '-std=c++11' ],
        'cflags_cc': [ '-std=c++11' ],
        'libraries': [ '/usr/lib/libwiringPi.so' ],
    - Add additional source file if neccesary

3. Update your [target_name].cc file with the following:
    std::string value = (std::string) info[0].ToString();
    std::string result = initialize(value);
    return Napi::String::New(env, result);

    This will allow the module to accept a string parameter,
    call the 'initialize(string)' function (this is the entrypoint
    to the c++ script), and return a string

4. In your JavaScript file, use the following lines to call the function
    -Use the following line to include the Napi file:
        const [variable] = require( './build/Release/[target_name].node');
    -Use the following line to call the function:
        [variable].Method(string)

5. Use the following command sequence to build and run the project:
    sudo node-gyp configure
    sudo node-gyp build

    Note: You can use the 'sudo node-gyp rebuild' command if you 
          only change the c++ source files

          If you recieve a 'module not found' error, check which
          module is mising and use 'sudo npm install [module]' 
          to correct this issue
    
    sudo node [JS Script that calls Napi function]
        - Example: sudo node index