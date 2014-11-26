module.exports = function(grunt) {
    // 构建任务配置
    grunt.initConfig({
        //读取package.json的内容，形成个json数据
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            //文件头部输出信息
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            //具体任务配置
            buildall: {
                options: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    },
                    report: 'min'
                },
                files: [{
                    expand: true,
                    cwd: 'scripts',
                    src: '**/*.js',
                    dest: 'dist'
                }]
            }
        },
        cssmin: {
            options: {
                banner: '/* <%= pkg.name %> - v<%= pkg.version %> - my awesome css banner */'
            },
            buildMain: {
                src: 'content/css2.0/main.css',
                dest: 'dist/css/main.css'
            },
            buildLogin: {
                src: 'content/css2.0/login.css',
                dest: 'dist/css/login.css'
            },
            buildVerify: {
                src: 'content/css2.0/verify.css',
                dest: 'dist/css/verify.css'
            },
            buildVoicemsg: {
                src: 'content/css2.0/voicemsg.css',
                dest: 'dist/css/voicemsg.css'
            }
        },
        watch: {
            scripts: {
                files: ['scripts/**/*.js'],
                tasks: ['minall'],
                options: {
                    spawn: true,
                    interrupt: true
                }
            }
        }
    });
    // 加载指定插件任务
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-css');
    // 默认执行的任务
    grunt.registerTask('mincss', ['cssmin']);
    grunt.registerTask('minall', ['uglify:buildall']);
    grunt.registerTask('default', ['uglify', 'concat', 'cssmin']);
};