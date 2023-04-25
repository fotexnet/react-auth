import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import Component, { FacebookLoginProps } from './FacebookLogin.component';

const config: Meta<FacebookLoginProps> = {
  title: 'Common/FacebookLogin',
  component: Component,
};

export default config;

const FacebookLoginStory: StoryFn<FacebookLoginProps> = args => <Component {...args} />;

export const FacebookLoginComponent = FacebookLoginStory.bind({});
FacebookLoginComponent.args = {};
