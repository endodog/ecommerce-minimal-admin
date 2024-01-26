import * as Yup from 'yup';
import { useCallback, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { styled } from '@mui/material/styles';
import { Grid, Card, Chip, Stack, Button, TextField, Typography, Autocomplete, Checkbox, TextareaAutosize } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import { RHFEditor, FormProvider, RHFTextField, RHFUploadSingleFile } from '../../../components/hook-form';
//
import BlogNewPostPreview from './BlogNewPostPreview';
import { fDate } from '../../../utils/formatTime';
import { replaceTagHtml } from '../../../utils/replaceContent';

// ----------------------------------------------------------------------

const TAGS_OPTION = [
  'Toy Story 3',
  'Logan',
  'Full Metal Jacket',
  'Dangal',
  'The Sting',
  '2001: A Space Odyssey',
  "Singin' in the Rain",
  'Toy Story',
  'Bicycle Thieves',
  'The Kid',
  'Inglourious Basterds',
  'Snatch',
  '3 Idiots',
];

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

// ----------------------------------------------------------------------

export default function BlogNewPostForm() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const handleOpenPreview = () => {
    setOpen(true);
  };

  const handleClosePreview = () => {
    setOpen(false);
  };


  const NewBlogSchema = Yup.object().shape({
    title: Yup.string().trim().required('Title is required'),
    description: Yup.string().trim().required('Sumnary is required'),
    content: Yup.string().trim().
      test('valid-content', 'Content is required', (value) => {
        const replaceContent = replaceTagHtml(value);
        return Boolean(replaceContent.trim());
      }).
      required('Content is required'),
    cover: Yup.mixed().required('Thumbnail is required'),
    tags: Yup.array().of(Yup.string()).min(1, "Tags must have at least 1 item").required(),
  });

  const defaultValues = {
    title: '',
    description: '',
    content: '',
    cover: null,
    tags: [],
  };

  const methods = useForm({
    resolver: yupResolver(NewBlogSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const values = watch();

  const onSubmit = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      handleClosePreview();
      enqueueSnackbar('Post success!');
      navigate(PATH_DASHBOARD.blog.posts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          'cover',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue]
  );

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <RHFTextField name="title" label="Post Title" />

                <Controller
                  name="tags"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Autocomplete
                      {...field}
                      fullWidth
                      multiple
                      disableCloseOnSelect
                      onChange={(event, newValue) => field.onChange(newValue)}
                      options={TAGS_OPTION.map((option) => option)}
                      renderOption={(props, option, { selected }) => (
                        <li {...props}>
                          <Checkbox color='info'
                            checked={selected}
                          />
                          {option}
                        </li>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip {...getTagProps({ index })} key={option} size="small" label={option} color="info" />
                        ))
                      }
                      renderInput={(params) => <TextField
                        error={!!error}
                        helperText={error?.message}
                        label="Tags" {...params} />}
                    />
                  )}
                />

                <RHFTextField name="description" label="Sumnary" multiline rows={3} />
                <div>
                  <LabelStyle>Thumbnail</LabelStyle>
                  <RHFUploadSingleFile name="cover" accept="image/*" maxSize={3145728} onDrop={handleDrop} />
                </div>

                <div>
                  <LabelStyle>Content</LabelStyle>
                  <RHFEditor name="content" />
                </div>

              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>

                <div >
                  <LabelStyle>Title</LabelStyle>
                  <span style={{ fontWeight: "600" }}>{values.title.trim() === "" ? "..." : values.title}</span>
                </div>

                <div >
                  <LabelStyle>Sumnary</LabelStyle>
                  <span style={{ fontWeight: "400" }}>{values.description.trim() === "" ? "..." : values.description}</span>
                </div>

                <div>
                  <LabelStyle>Date</LabelStyle>
                  <span>{fDate(new Date())}</span>
                </div>

                <div>
                  <LabelStyle>Tags</LabelStyle>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {values.tags.map((item, index) => (
                      <div style={{ marginRight: "5px", marginBottom: "5px" }}>
                        <Chip key={index} label={item} color="info" />
                      </div>
                    ))}
                    {values.tags.length === 0 ? "..." : ""}
                  </div>
                </div>

              </Stack>
            </Card>

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              <Button fullWidth color="inherit" variant="outlined" size="large" onClick={handleOpenPreview}>
                Preview
              </Button>
              <LoadingButton fullWidth type="submit" variant="contained" size="large" loading={isSubmitting}>
                Post
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>

      <BlogNewPostPreview
        values={values}
        isOpen={open}
        isValid={isValid}
        isSubmitting={isSubmitting}
        onClose={handleClosePreview}
        onSubmit={handleSubmit(onSubmit)}
      />
    </>
  );
}
