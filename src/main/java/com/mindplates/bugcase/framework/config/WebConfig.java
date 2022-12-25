package com.mindplates.bugcase.framework.config;

import com.mindplates.bugcase.biz.user.service.UserService;
import com.mindplates.bugcase.common.util.SessionUtil;
import com.mindplates.bugcase.framework.converter.LongToLocalDateTimeConverter;
import com.mindplates.bugcase.framework.converter.StringToLocalDateConverter;
import com.mindplates.bugcase.framework.converter.StringToLocalDateTimeConverter;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.MessageSourceAccessor;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;


@Configuration
public class WebConfig implements WebMvcConfigurer {


    private final SessionUtil sessionUtil;
    private final UserService userService;
    @Value("${spring.profiles.active}")
    private String activeProfile;
    @Value("${bug-case.corsUrls}")
    private String[] corsUrls;

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    public WebConfig(SessionUtil sessionUtil, UserService userService) {
        this.sessionUtil = sessionUtil;
        this.userService = userService;
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**").allowedOrigins(this.corsUrls)
                .allowedMethods("GET", "PUT", "POST", "DELETE", "OPTIONS").allowCredentials(true);
    }

    @Bean
    public ReloadableResourceBundleMessageSource messageSource() {
        ReloadableResourceBundleMessageSource source = new ReloadableResourceBundleMessageSource();
        source.setBasename("classpath:/messages/message");
        source.setDefaultEncoding("UTF-8");
        source.setCacheSeconds(60);
        source.setUseCodeAsDefaultMessage(true);
        return source;
    }

    @Bean
    public MessageSourceAccessor messageSourceAccessor() {
        return new MessageSourceAccessor(messageSource());
    }


    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");
        return interceptor;
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new LongToLocalDateTimeConverter());
        registry.addConverter(new StringToLocalDateConverter());
        registry.addConverter(new StringToLocalDateTimeConverter());
    }


}
