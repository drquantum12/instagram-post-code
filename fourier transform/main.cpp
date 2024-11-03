#include <opencv2/opencv.hpp>
#include <iostream>
#include <vector>
#include <cmath>
#include <complex>

using namespace std;
using namespace cv;

// Define the Pi constant
constexpr double MY_PI = 3.14159265358979323846;

// Complex type definition
using Complex_ = complex<double>;

void dft1D(const vector<Complex_> &input, vector<Complex_> &output, int n){
    for(int k=0; k<n; ++k){
        output[k] = {0.0, 0.0};
        for(int j=0; j<n; ++j){
            double angle = -2.0 * MY_PI * j* k /n;
            output[k] += input[j] * Complex_(cos(angle), sin(angle));
        }
    }
}

// Perform 2D DFT on an image matrix
void dft2D(const vector<vector<Complex_>> &input, vector<vector<Complex_>> &output, int width, int height) {
    vector<Complex_> temp_in(height);
    vector<Complex_> temp_out(height);

    // Apply DFT row-wise
    for (int i = 0; i < height; ++i) {
        dft1D(input[i], output[i], width);
    }

    // Apply DFT column-wise on top of the row-wise transformed values
    for (int j = 0; j < width; ++j) {
        for (int i = 0; i < height; ++i) {
            temp_in[i] = output[i][j];
        }
        dft1D(temp_in, temp_out, height);
        for (int i = 0; i < height; ++i) {
            output[i][j] = temp_out[i];
        }
    }
}

void applyLowPassFilter(vector<vector<Complex_>> &dft, int width, int height, int cutoff){
    for(int i=0; i<height; ++i){
        for(int j=0; j<width; ++j){
            if(i > cutoff || j > cutoff){
                dft[i][j] = {0.0, 0.0};
            }
        }
    }
}

void idft1D(const vector<Complex_> &input, vector<Complex_> &output, int n){
    for(int k=0; k<n; ++k){
        output[k] = {0.0, 0.0};
        for(int j=0; j<n; ++j){
            double angle = 2.0*MY_PI*j*k /n;
            output[k] += input[j]*Complex_(cos(angle), sin(angle));
        }
        output[k] /= n;
    }
}

void idft2D(const vector<vector<Complex_>> &input, vector<vector<Complex_>> &output, int width, int height) {
    vector<Complex_> temp_in(height);
    vector<Complex_> temp_out(height);

    // Apply IDFT row-wise
    for (int i = 0; i < height; ++i) {
        idft1D(input[i], output[i], width);
    }

    // Apply IDFT column-wise
    for (int j = 0; j < width; ++j) {
        for (int i = 0; i < height; ++i) {
            temp_in[i] = output[i][j];
        }
        idft1D(temp_in, temp_out, height);
        for (int i = 0; i < height; ++i) {
            output[i][j] = temp_out[i];
        }
    }
}

int main() {
    // Load image using OpenCV in grayscale mode
    Mat img = imread("robo.jpeg", IMREAD_GRAYSCALE);
    if (img.empty()) {
        cerr << "Error loading image" << endl;
        return -1;
    }
    
    int width = img.cols;
    int height = img.rows;

    vector<vector<Complex_>> dft_output(height, vector<Complex_>(width));
    vector<vector<Complex_>> idft_output(height, vector<Complex_>(width));

    vector<vector<Complex_>> input(height, vector<Complex_>(width));
    for(int i=0; i<height; ++i){
        for(int j=0; j<width; ++j){
            input[i][j] = static_cast<double>(img.at<uchar>(i,j));

        }


    }


    // // Performing 2D DFT
    dft2D(input, dft_output, width, height);


    // Apply low-pass filter
    applyLowPassFilter(dft_output, width, height, 30);  // Cutoff frequency of 30

    // Perform 2D IDFT
    idft2D(dft_output, idft_output, width, height);

    // Prepare output image data
    Mat output_img(height, width, CV_8UC1);
    for (int i = 0; i < height; ++i) {
        for (int j = 0; j < width; ++j) {
            output_img.at<uchar>(i, j) = static_cast<unsigned char>(abs(idft_output[i][j].real()));
        }
    }

    // Save the compressed image
    imwrite("output_compressed.jpeg", output_img);

    cout << "Image compression done." << endl;

    return 0;
}