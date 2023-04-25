import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import Component, { GoogleLoginProps } from './GoogleLogin.component';

const config: Meta<GoogleLoginProps> = {
  title: 'Common/GoogleLogin',
  component: Component,
};

export default config;

const GoogleLoginStory: StoryFn<GoogleLoginProps> = args => <Component {...args} />;

export const GoogleLoginComponent = GoogleLoginStory.bind({});
GoogleLoginComponent.args = {};
